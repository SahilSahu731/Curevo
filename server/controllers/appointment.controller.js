import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import { addToQueue, removeFromQueue } from "../utils/queueManager.js";
import { createTelehealthRoomId, isLegacyRoomId, isTelehealthWindowOpen } from "../utils/telehealth.js";
import { createRoomGrant } from "../utils/roomGrant.js";
import { reserveAndBook, releaseAppointmentSlot, rescheduleBooking } from "../services/booking.service.js";
import { transitionAppointment } from "../services/appointmentState.service.js";
import { notifyAppointment } from "../services/notification.service.js";

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const populateAppointment = (query) => query
  .populate('patientId', 'name email phone profileImage gender dateOfBirth')
  .populate({
    path: 'doctorId',
    populate: { path: 'userId', select: 'name email profileImage phone' }
  })
  .populate('clinicId', 'name address city phone');

const getDoctorForUser = (userId) => Doctor.findOne({ userId });

const canAccessAppointment = async (user, appointment) => {
  if (user.role === 'admin') return true;
  if (appointment.patientId?._id?.toString?.() === user.id || appointment.patientId?.toString?.() === user.id) return true;
  if (user.role !== 'doctor') return false;
  const doctor = await getDoctorForUser(user.id);
  return doctor?._id.toString() === appointment.doctorId?._id?.toString?.() || doctor?._id.toString() === appointment.doctorId?.toString?.();
};

const canJoinTelehealth = async (user, appointment) => {
  if (!user?.emailVerifiedAt || !['patient', 'doctor'].includes(user.role)) return false;
  if (user.role === 'patient') return appointment.patientId?.toString() === user.id;
  const doctor = await Doctor.findOne({ userId: user.id, _id: appointment.doctorId, 'verification.status': 'approved' }).select('_id').lean();
  return Boolean(doctor);
};

const attachTelehealth = (appointment) => {
  if (appointment.consultationType !== 'video') {
    appointment.telehealthRoomId = undefined;
    appointment.telehealthUrl = undefined;
    return;
  }

  if (!appointment.telehealthRoomId || isLegacyRoomId(appointment.telehealthRoomId)) {
    appointment.telehealthRoomId = createTelehealthRoomId();
    appointment.telehealthGrantVersion = (appointment.telehealthGrantVersion || 0) + 1;
  }
  appointment.telehealthUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/telehealth/room/${appointment.telehealthRoomId}`;
};

export const getAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    }
    if (req.user.role === 'doctor') {
      const doctor = await getDoctorForUser(req.user.id);
      if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });
      query.doctorId = doctor._id;
    }
    if (status && status !== 'all') query.status = status;
    if (date) query.date = mongoose.trusted({ $gte: getStartOfDay(date), $lte: getEndOfDay(date) });

    const appointments = await populateAppointment(Appointment.find(query).setOptions({ sanitizeFilter: false }))
      .sort({ date: 1, tokenNumber: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error("Get Appointments Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
    }

    const appointment = await populateAppointment(Appointment.findById(id));
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error("Get Appointment Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const createAppointment = async (req, res) => {
  try {
    if (req.user.role !== "admin") req.body.priority = "normal";
    const patientId = req.user.role === "admin" && req.body.patientId ? req.body.patientId : req.user.id;
    const result = await reserveAndBook({
      patientId,
      payload: req.body,
      idempotencyKey: req.get("Idempotency-Key"),
    });
    await notifyAppointment({ appointment: result.appointment, type: "booking-confirmation" });
    if (result.appointment.consultationType === "video") await notifyAppointment({ appointment: result.appointment, type: "telehealth-ready" });
    if (result.appointment.priority === "emergency" && !result.replayed) {
      const { writeAuditEvent } = await import("../utils/audit.js");
      await writeAuditEvent(req, "emergency-priority-assigned", "success", { targetUserId: result.appointment.patientId, metadata: { appointmentId: result.appointment._id.toString() } });
    }
    res.status(result.replayed ? 200 : 201).json({
      success: true,
      replayed: result.replayed,
      message: result.replayed ? "Original booking returned" : "Appointment created",
      data: result.appointment,
    });
  } catch (error) {
    if (!error.statusCode || error.statusCode >= 500) console.error("Create Appointment Error:", error.message);
    res.status(error.statusCode || 500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const editableFieldsByRole = {
      patient: ['symptoms'],
      doctor: ['notes'],
      admin: ['priority', 'symptoms', 'notes'],
    };
    const allowedFields = editableFieldsByRole[req.user.role] || [];
    const statusChanged = req.body.status !== undefined && req.body.status !== appointment.status;
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) appointment[field] = req.body[field];
    });
    await appointment.save();
    let current = appointment;
    if (statusChanged) {
      ({ appointment: current } = await transitionAppointment({ appointment, to: req.body.status, actor: req.user, reason: req.body.reason }));
    }

    if (current.status === 'waiting') await addToQueue(current._id);
    if (['cancelled', 'completed', 'no-show'].includes(current.status)) await removeFromQueue(current);
    if (['cancelled', 'no-show'].includes(current.status)) await releaseAppointmentSlot(current._id);

    const populated = await populateAppointment(Appointment.findById(current._id));
    res.status(200).json({ success: true, message: "Appointment updated", data: populated });
  } catch (error) {
    console.error("Update Appointment Error:", error);
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (req.user.role === "patient" && appointment.slotStartUtc) {
      const clinic = await Clinic.findById(appointment.clinicId).select("cancellationNoticeHours");
      const cutoff = new Date(appointment.slotStartUtc).getTime() - (clinic?.cancellationNoticeHours || 0) * 60 * 60_000;
      if (Date.now() > cutoff) return res.status(409).json({ success: false, error: "Cancellation window has closed; contact the clinic" });
    }
    const result = await transitionAppointment({ appointment, to: "cancelled", actor: req.user, reason: req.body?.reason });
    await removeFromQueue(result.appointment);
    await releaseAppointmentSlot(result.appointment._id);
    await notifyAppointment({ appointment: result.appointment, type: "appointment-cancelled" });
    res.status(200).json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.error("Delete Appointment Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) return res.status(403).json({ success: false, error: "Not authorized" });
    const updated = await rescheduleBooking({ appointment, payload: req.body, actor: req.user });
    await notifyAppointment({ appointment: updated, type: "appointment-rescheduled", suffix: updated.updatedAt?.toISOString?.() || String(updated.__v) });
    return res.json({ success: true, message: "Appointment rescheduled", data: updated });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, error: error.statusCode ? error.message : "Appointment could not be rescheduled" });
  }
};

export const getTelehealthSession = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canJoinTelehealth(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    if (appointment.consultationType !== 'video') {
      return res.status(400).json({ success: false, error: "This appointment is not a telehealth visit" });
    }
    if (!isTelehealthWindowOpen(appointment)) {
      return res.status(403).json({ success: false, error: "The telehealth room is only available during the appointment window" });
    }

    attachTelehealth(appointment);
    await appointment.save();
    const accessGrant = createRoomGrant({
      appointmentId: appointment._id,
      roomId: appointment.telehealthRoomId,
      userId: req.user._id,
      role: req.user.role,
      grantVersion: appointment.telehealthGrantVersion,
    });

    res.status(200).json({
      success: true,
      data: {
        roomId: appointment.telehealthRoomId,
        url: appointment.telehealthUrl,
        appointmentId: appointment._id,
        accessGrant,
      }
    });
  } catch (error) {
    console.error("Telehealth Session Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getTelehealthAccessByRoom = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      telehealthRoomId: req.params.roomId,
      consultationType: 'video',
    });
    if (!appointment) return res.status(404).json({ success: false, error: "Telehealth room not found" });
    if (!(await canJoinTelehealth(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    if (!isTelehealthWindowOpen(appointment)) {
      return res.status(403).json({ success: false, error: "The telehealth room is only available during the appointment window" });
    }
    attachTelehealth(appointment);
    await appointment.save();
    const accessGrant = createRoomGrant({
      appointmentId: appointment._id,
      roomId: appointment.telehealthRoomId,
      userId: req.user._id,
      role: req.user.role,
      grantVersion: appointment.telehealthGrantVersion,
    });
    res.status(200).json({
      success: true,
      data: { roomId: appointment.telehealthRoomId, appointmentId: appointment._id, accessGrant },
    });
  } catch {
    res.status(500).json({ success: false, error: "Telehealth access could not be prepared" });
  }
};
