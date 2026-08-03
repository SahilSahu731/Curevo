import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Appointment from "../models/appointment.model.js";
import Clinic from "../models/clinic.model.js";
import ClinicReview from "../models/clinicReview.model.js";
import Doctor from "../models/doctor.model.js";
import Notification from "../models/notification.model.js";
import Queue from "../models/queue.model.js";
import QueueCounter from "../models/queueCounter.model.js";
import Review from "../models/review.model.js";
import SlotReservation from "../models/slotReservation.model.js";
import User from "../models/user.model.js";
import { localDateInTimezone, localDateTimeToUtc, normalizeTime } from "../utils/scheduling.js";

const result = { users: 0, clinics: 0, doctors: 0, appointments: 0, queues: 0, counters: 0, reservations: 0, reviews: 0, notifications: 0 };

try {
  await connectDB();
  const db = mongoose.connection.db;
  const users = await db.collection(User.collection.name).updateMany(
    { status: { $exists: false }, isSynthetic: true },
    { $set: { status: "active", notificationPreferences: { inApp: true, email: false, sms: false, appointmentUpdates: true, reminders: true, locale: "en-IN" } } },
  );
  result.users = users.modifiedCount;
  const clinics = await db.collection(Clinic.collection.name).find({}).toArray();
  const clinicById = new Map(clinics.map((clinic) => [clinic._id.toString(), clinic]));
  for (const clinic of clinics) {
    const timezone = clinic.timezone || "Asia/Kolkata";
    await db.collection(Clinic.collection.name).updateOne({ _id: clinic._id }, { $set: { timezone, bookingHorizonDays: clinic.bookingHorizonDays || 90, cancellationNoticeHours: clinic.cancellationNoticeHours ?? 2, supportedConsultationTypes: clinic.supportedConsultationTypes?.length ? clinic.supportedConsultationTypes : ["in-person", "video"] } });
    result.clinics += 1;
  }

  const doctors = await db.collection(Doctor.collection.name).find({}).toArray();
  for (const doctor of doctors) {
    const set = {};
    if (!doctor.verification?.status) set["verification.status"] = "not-submitted";
    if (doctor.verification?.status === "approved" && !doctor.verification?.expiresAt) set["verification.expiresAt"] = new Date(Date.now() + 365 * 24 * 60 * 60_000);
    if (!doctor.verification?.history) set["verification.history"] = [];
    if (!doctor.leavePeriods) set.leavePeriods = [];
    if (Object.keys(set).length) await db.collection(Doctor.collection.name).updateOne({ _id: doctor._id }, { $set: set });
    result.doctors += 1;
  }

  const appointments = await db.collection(Appointment.collection.name).find({ $or: [{ slotStartUtc: { $exists: false } }, { clinicTimezone: { $exists: false } }] }).toArray();
  for (const appointment of appointments) {
    const clinic = clinicById.get(appointment.clinicId?.toString());
    const timezone = clinic?.timezone || "Asia/Kolkata";
    const localDate = localDateInTimezone(appointment.date, timezone);
    let startUtc;
    try { startUtc = localDateTimeToUtc(localDate, normalizeTime(appointment.slotTime), timezone); } catch { continue; }
    const duration = clinic?.averageConsultationTime || 15;
    await db.collection(Appointment.collection.name).updateOne({ _id: appointment._id }, { $set: { slotTime: normalizeTime(appointment.slotTime), slotStartUtc: startUtc, slotEndUtc: new Date(startUtc.getTime() + duration * 60_000), clinicTimezone: timezone, statusHistory: appointment.statusHistory || [] } });
    result.appointments += 1;
  }

  const queues = await db.collection(Queue.collection.name).find({ localDate: { $exists: false } }).toArray();
  for (const queue of queues) {
    const clinic = clinicById.get(queue.clinicId?.toString());
    const timezone = clinic?.timezone || "Asia/Kolkata";
    await db.collection(Queue.collection.name).updateOne({ _id: queue._id }, { $set: { localDate: localDateInTimezone(queue.date, timezone), timezone } });
    result.queues += 1;
  }

  const allAppointments = await db.collection(Appointment.collection.name).find({ slotStartUtc: { $type: "date" } }).toArray();
  const counterMax = new Map();
  for (const appointment of allAppointments) {
    const timezone = appointment.clinicTimezone || clinicById.get(appointment.clinicId?.toString())?.timezone || "Asia/Kolkata";
    const localDate = localDateInTimezone(appointment.slotStartUtc, timezone);
    const key = `${appointment.clinicId}:${appointment.doctorId}:${localDate}`;
    const current = counterMax.get(key);
    if (!current || appointment.tokenNumber > current.sequence) counterMax.set(key, { clinicId: appointment.clinicId, doctorId: appointment.doctorId, localDate, timezone, sequence: appointment.tokenNumber || 0, isSynthetic: Boolean(appointment.isSynthetic), seedBatch: appointment.seedBatch });
    if (["booked", "waiting", "in-progress"].includes(appointment.status) && new Date(appointment.slotEndUtc || appointment.slotStartUtc) > new Date()) {
      await db.collection(SlotReservation.collection.name).updateOne(
        { appointmentId: appointment._id },
        { $setOnInsert: { doctorId: appointment.doctorId, clinicId: appointment.clinicId, patientId: appointment.patientId, slotStartUtc: appointment.slotStartUtc, slotEndUtc: appointment.slotEndUtc, appointmentId: appointment._id, state: "booked", expiresAt: new Date(new Date(appointment.slotEndUtc).getTime() + 86_400_000), createdAt: new Date() }, $set: { isSynthetic: Boolean(appointment.isSynthetic), seedBatch: appointment.seedBatch, updatedAt: new Date() } },
        { upsert: true },
      );
      result.reservations += 1;
    }
  }
  for (const counter of counterMax.values()) {
    await db.collection(QueueCounter.collection.name).updateOne(
      { clinicId: counter.clinicId, doctorId: counter.doctorId, localDate: counter.localDate },
      { $max: { sequence: counter.sequence }, $setOnInsert: { timezone: counter.timezone, createdAt: new Date() }, $set: { isSynthetic: counter.isSynthetic, seedBatch: counter.seedBatch, updatedAt: new Date() } },
      { upsert: true },
    );
    result.counters += 1;
  }

  const doctorReviews = await db.collection(Review.collection.name).updateMany({ status: { $exists: false } }, { $set: { status: "published" } });
  const clinicReviews = await db.collection(ClinicReview.collection.name).updateMany({ status: { $exists: false } }, { $set: { status: "published" } });
  result.reviews = doctorReviews.modifiedCount + clinicReviews.modifiedCount;
  const notifications = await db.collection(Notification.collection.name).updateMany({ deliveryStatus: { $exists: false } }, { $set: { templateKey: "legacy", locale: "en-IN", channels: ["in-app"], deliveryStatus: "sent", attempts: 1 } });
  result.notifications = notifications.modifiedCount;

  for (const model of [User, Appointment, Clinic, Doctor, Queue, QueueCounter, SlotReservation, Review, ClinicReview, Notification]) await model.createIndexes();
  console.log(JSON.stringify(result));
  await mongoose.disconnect();
} catch (error) {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
}
