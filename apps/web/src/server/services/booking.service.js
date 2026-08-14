import crypto from "node:crypto";
import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";
import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";
import SlotReservation from "../models/slotReservation.model.js";
import { createTelehealthRoomId } from "../utils/telehealth.js";
import { evaluateSlot } from "../utils/scheduling.js";
import { generateToken } from "../utils/tokenGenerator.js";

const conflict = (message) => Object.assign(new Error(message), { statusCode: 409 });

export const reserveAndBook = async ({ patientId, payload, idempotencyKey }) => {
  if (payload.priority === "emergency" && String(payload.emergencyReason || "").trim().length < 10) {
    throw Object.assign(new Error("An emergency-priority policy reason is required"), { statusCode: 400 });
  }
  const key = String(idempotencyKey || payload.idempotencyKey || "").trim().slice(0, 120);
  if (key) {
    const replay = await Appointment.findOne({ patientId, idempotencyKey: key });
    if (replay) return { appointment: replay, replayed: true };
  }

  const doctor = await Doctor.findById(payload.doctorId).select("+verification.licenseFilePublicId +verification.history");
  if (!doctor) throw Object.assign(new Error("Doctor not found"), { statusCode: 404 });
  const clinicId = payload.clinicId || doctor.clinicId;
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) throw Object.assign(new Error("Clinic not found"), { statusCode: 404 });

  const slot = await evaluateSlot({
    doctor,
    clinic,
    localDate: payload.date,
    slotTime: payload.slotTime,
    consultationType: payload.consultationType || "in-person",
  });

  let reservation;
  try {
    reservation = await SlotReservation.create({
      doctorId: doctor._id,
      clinicId: clinic._id,
      patientId,
      slotStartUtc: slot.startUtc,
      slotEndUtc: slot.endUtc,
      expiresAt: new Date(Date.now() + 15 * 60_000),
    });
  } catch (error) {
    if (error?.code === 11000) {
      if (key) {
        const replay = await Appointment.findOne({ patientId, idempotencyKey: key });
        if (replay) return { appointment: replay, replayed: true };
      }
      throw conflict("Slot already booked or temporarily held");
    }
    throw error;
  }

  try {
    const tokenNumber = await generateToken(clinic._id, doctor._id, slot.startUtc, slot.timezone);
    const consultationType = payload.consultationType || "in-person";
    const appointment = await Appointment.create({
      patientId,
      doctorId: doctor._id,
      clinicId: clinic._id,
      date: slot.startUtc,
      slotTime: slot.slotTime,
      slotStartUtc: slot.startUtc,
      slotEndUtc: slot.endUtc,
      clinicTimezone: slot.timezone,
      tokenNumber,
      symptoms: payload.symptoms,
      priority: payload.priority || "normal",
      emergencyReason: payload.priority === "emergency" ? payload.emergencyReason.trim() : undefined,
      consultationType,
      idempotencyKey: key || undefined,
      status: "booked",
      telehealthRoomId: consultationType === "video" ? createTelehealthRoomId() : undefined,
      telehealthGrantVersion: consultationType === "video" ? 1 : 0,
    });
    if (consultationType === "video") {
      appointment.telehealthUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/telehealth/room/${appointment.telehealthRoomId}`;
      await appointment.save();
    }
    reservation.state = "booked";
    reservation.appointmentId = appointment._id;
    reservation.expiresAt = new Date(slot.endUtc.getTime() + 24 * 60 * 60_000);
    await reservation.save();
    return { appointment, replayed: false };
  } catch (error) {
    await SlotReservation.updateOne({ _id: reservation._id }, { state: "released", expiresAt: new Date() }).catch(() => {});
    if (error?.code === 11000) throw conflict("Duplicate booking request");
    throw error;
  }
};

export const releaseAppointmentSlot = async (appointmentId) => {
  await SlotReservation.updateOne(
    { appointmentId, state: mongoose.trusted({ $in: ["held", "booked"] }) },
    { $set: { state: "released", expiresAt: new Date() } },
    { sanitizeFilter: false },
  );
};

export const rescheduleBooking = async ({ appointment, payload, actor }) => {
  if (appointment.status !== "booked") throw conflict("Only booked appointments can be rescheduled");
  const doctor = await Doctor.findById(payload.doctorId || appointment.doctorId).select("+verification.licenseFilePublicId");
  const clinic = await Clinic.findById(payload.clinicId || doctor?.clinicId);
  if (!doctor || !clinic) throw Object.assign(new Error("Doctor or clinic not found"), { statusCode: 404 });
  const slot = await evaluateSlot({ doctor, clinic, localDate: payload.date, slotTime: payload.slotTime, consultationType: payload.consultationType || appointment.consultationType, excludeAppointmentId: appointment._id });
  let reservation;
  try {
    reservation = await SlotReservation.create({ doctorId: doctor._id, clinicId: clinic._id, patientId: appointment.patientId, slotStartUtc: slot.startUtc, slotEndUtc: slot.endUtc, expiresAt: new Date(Date.now() + 15 * 60_000) });
  } catch (error) {
    if (error.code === 11000) throw conflict("Slot already booked or temporarily held");
    throw error;
  }
  try {
    const tokenNumber = await generateToken(clinic._id, doctor._id, slot.startUtc, slot.timezone);
    const updated = await Appointment.findOneAndUpdate(
      { _id: appointment._id, status: "booked", __v: appointment.__v },
      {
        $set: { doctorId: doctor._id, clinicId: clinic._id, date: slot.startUtc, slotTime: slot.slotTime, slotStartUtc: slot.startUtc, slotEndUtc: slot.endUtc, clinicTimezone: slot.timezone, tokenNumber, consultationType: payload.consultationType || appointment.consultationType },
        $inc: { __v: 1, telehealthGrantVersion: 1 },
        $push: { statusHistory: { from: "booked", to: "booked", actorUserId: actor._id, actorRole: actor.role, reason: "rescheduled" } },
      },
      { new: true },
    );
    if (!updated) throw conflict("Appointment changed in another request; refresh and retry");
    if (updated.consultationType === "video" && !updated.telehealthRoomId) {
      updated.telehealthRoomId = createTelehealthRoomId();
      updated.telehealthUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/telehealth/room/${updated.telehealthRoomId}`;
      await updated.save();
    } else if (updated.consultationType !== "video") {
      updated.telehealthRoomId = undefined;
      updated.telehealthUrl = undefined;
      await updated.save();
    }
    await SlotReservation.updateOne({ appointmentId: appointment._id, state: "booked" }, { state: "released", expiresAt: new Date() });
    reservation.state = "booked"; reservation.appointmentId = updated._id; reservation.expiresAt = new Date(slot.endUtc.getTime() + 86_400_000); await reservation.save();
    return updated;
  } catch (error) {
    await SlotReservation.updateOne({ _id: reservation._id }, { state: "released", expiresAt: new Date() }).catch(() => {});
    throw error;
  }
};

export const createGeneratedIdempotencyKey = () => crypto.randomUUID();
