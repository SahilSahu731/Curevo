import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import { sendAccountEmail } from "../utils/mail.js";

const TEMPLATES = {
  "booking-confirmation": { subject: "Appointment confirmed", message: "Your appointment is confirmed. Open Curevo for the time and clinic details." },
  "appointment-reminder": { subject: "Appointment reminder", message: "You have an upcoming appointment. Open Curevo to review the details." },
  "telehealth-ready": { subject: "Video appointment ready", message: "Your video appointment is confirmed. Use the secure Curevo link when your appointment window opens." },
  "check-in-open": { subject: "Check-in is available", message: "Check-in is now available for your appointment." },
  "turn-approaching": { subject: "Your turn is approaching", message: "Your queue turn is approaching. Please remain available." },
  "turn-now": { subject: "It is your turn", message: "It is your turn. Open Curevo for the next step." },
  "appointment-completed": { subject: "Appointment completed", message: "Your appointment is marked complete. Follow-up information is available in Curevo." },
  "follow-up": { subject: "Follow-up reminder", message: "A follow-up is due. Open Curevo to review it." },
  "appointment-cancelled": { subject: "Appointment cancelled", message: "Your appointment was cancelled. Open Curevo for details or to book again." },
  "appointment-rescheduled": { subject: "Appointment rescheduled", message: "Your appointment time changed. Open Curevo to review the updated details." },
};

export const deliverNotification = async (notification) => {
  const user = await User.findById(notification.userId).select("email notificationPreferences");
  if (!user) return notification;
  let emailDelivered = false;
  notification.attempts += 1;
  notification.lastAttemptAt = new Date();
  notification.failureCode = undefined;
  if (notification.channels.includes("email") && user.notificationPreferences?.email) {
    try {
      const result = await sendAccountEmail({ to: user.email, subject: TEMPLATES[notification.type]?.subject || "Curevo update", text: `${notification.message}\n\n${notification.safeLink || ""}`.trim() });
      emailDelivered = result.delivered;
      if (!result.delivered) notification.failureCode = result.reason;
    } catch {
      notification.failureCode = "email-provider-error";
    }
  }
  notification.deliveryStatus = emailDelivered || notification.channels.includes("in-app") ? (notification.failureCode ? "partial" : "sent") : "failed";
  if (notification.deliveryStatus === "sent") notification.deliveredAt = new Date();
  await notification.save();
  return notification;
};

export const notifyAppointment = async ({ appointment, type, suffix = "v1" }) => {
  const template = TEMPLATES[type];
  if (!template || !appointment?.patientId) return null;
  const user = await User.findById(appointment.patientId).select("notificationPreferences");
  if (user?.notificationPreferences?.appointmentUpdates === false && type !== "appointment-reminder") return null;
  if (type === "appointment-reminder" && user?.notificationPreferences?.reminders === false) return null;
  const base = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  const channels = ["in-app"];
  if (user.notificationPreferences?.email) channels.push("email");
  const safePath = type === "telehealth-ready" && appointment.telehealthRoomId ? `/telehealth/room/${appointment.telehealthRoomId}` : "/patient-dashboard/appointments";
  const notification = await Notification.findOneAndUpdate(
    { userId: user._id, dedupKey: `${appointment._id}:${type}:${suffix}` },
    { $setOnInsert: { appointmentId: appointment._id, type, templateKey: type, message: template.message, safeLink: `${base}${safePath}`, locale: user.notificationPreferences?.locale || "en-IN", channels } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (notification.attempts === 0) await deliverNotification(notification);
  return notification;
};

export const notifyUser = async ({ userId, message, dedupKey, safeLink = "/profile" }) => {
  const user = await User.findById(userId).select("notificationPreferences");
  if (!user) return null;
  const base = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  const channels = ["in-app"];
  if (user.notificationPreferences?.email) channels.push("email");
  const notification = await Notification.findOneAndUpdate(
    { userId, dedupKey },
    { $setOnInsert: { type: "system-alert", templateKey: "system-alert", message: String(message).slice(0, 500), safeLink: `${base}${safeLink}`, channels, locale: user.notificationPreferences?.locale || "en-IN" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (notification.attempts === 0) await deliverNotification(notification);
  return notification;
};

export const sendDueReminders = async (now = new Date()) => {
  const end = new Date(now.getTime() + 24 * 60 * 60_000);
  const appointments = await Appointment.find({ slotStartUtc: mongoose.trusted({ $gt: now, $lte: end }), status: "booked" }).select("patientId slotStartUtc");
  const followUpEnd = new Date(now.getTime() + 24 * 60 * 60_000);
  const followUps = await MedicalRecord.find({ followUpDate: mongoose.trusted({ $gt: now, $lte: followUpEnd }) }).select("appointmentId").populate("appointmentId", "patientId");
  const results = await Promise.all([
    ...appointments.map((appointment) => notifyAppointment({ appointment, type: "appointment-reminder", suffix: "24h" })),
    ...followUps.filter((record) => record.appointmentId).map((record) => notifyAppointment({ appointment: record.appointmentId, type: "follow-up", suffix: record.followUpDate?.toISOString?.().slice(0, 10) || "due" })),
  ]);
  return results.filter(Boolean).length;
};
