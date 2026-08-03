import Appointment from "../models/appointment.model.js";
import Clinic from "../models/clinic.model.js";
import Queue from "../models/queue.model.js";
import { getIO } from "../config/socket.js";
import { localDateInTimezone, localDateTimeToUtc } from "./scheduling.js";

const waitingCount = (queue) => (queue.appointmentIds?.length || 0) + (queue.emergencyQueue?.length || 0);

const queueIdentity = async (appointment) => {
  const clinic = await Clinic.findById(appointment.clinicId).select("timezone averageConsultationTime").lean();
  const timezone = appointment.clinicTimezone || clinic?.timezone || "Asia/Kolkata";
  const instant = appointment.slotStartUtc || appointment.date;
  const localDate = localDateInTimezone(instant, timezone);
  return { timezone, localDate, date: localDateTimeToUtc(localDate, "00:00", timezone), averageConsultationTime: clinic?.averageConsultationTime || 15 };
};

export const emitQueueEvents = (queue, appointment = null, eventName = "queue_updated") => {
  try {
    const payload = {
      queueId: queue._id,
      doctorId: queue.doctorId,
      clinicId: queue.clinicId,
      currentToken: queue.currentToken,
      waitingCount: waitingCount(queue),
      updatedAt: queue.lastUpdated,
      appointmentId: appointment?._id,
      status: appointment?.status,
    };
    const io = getIO();
    for (const room of [`clinic-${queue.clinicId}`, `doctor-${queue.doctorId}`]) {
      io.to(room).emit("queue_updated", payload);
      io.to(room).emit("queue-update", payload);
    }
    if (appointment) {
      io.to(`appointment-${appointment._id}`).emit(eventName, payload);
      if (eventName === "patient_called") io.to(`appointment-${appointment._id}`).emit("your-turn", payload);
    }
  } catch {
    // Socket updates are best-effort and contain no patient health data.
  }
};

export const addToQueue = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { statusCode: 404 });
  if (appointment.status !== "waiting") throw Object.assign(new Error("Only checked-in appointments can enter a queue"), { statusCode: 409 });
  const identity = await queueIdentity(appointment);
  const target = appointment.priority === "emergency" ? "emergencyQueue" : "appointmentIds";
  const other = target === "emergencyQueue" ? "appointmentIds" : "emergencyQueue";
  const queue = await Queue.findOneAndUpdate(
    { doctorId: appointment.doctorId, clinicId: appointment.clinicId, localDate: identity.localDate },
    {
      $setOnInsert: { date: identity.date, timezone: identity.timezone, currentToken: 0 },
      $set: { lastUpdated: new Date() },
      $addToSet: { [target]: appointment._id },
      $pull: { [other]: appointment._id },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  emitQueueEvents(queue, appointment);
  return queue;
};

export const removeFromQueue = async (appointment, { emit = true } = {}) => {
  const identity = await queueIdentity(appointment);
  const queue = await Queue.findOneAndUpdate(
    { doctorId: appointment.doctorId, clinicId: appointment.clinicId, localDate: identity.localDate },
    { $pull: { appointmentIds: appointment._id, emergencyQueue: appointment._id }, $set: { lastUpdated: new Date() } },
    { new: true },
  );
  if (queue && emit) emitQueueEvents(queue, appointment);
  return queue;
};

export const getQueuePosition = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw Object.assign(new Error("Appointment not found"), { statusCode: 404 });
  const identity = await queueIdentity(appointment);
  const queue = await Queue.findOne({ doctorId: appointment.doctorId, clinicId: appointment.clinicId, localDate: identity.localDate }).lean();
  if (!queue) return { position: null, waitTime: null, patientsAhead: 0 };
  const id = appointment._id.toString();
  const emergencyIndex = queue.emergencyQueue.findIndex((value) => value.toString() === id);
  const normalIndex = queue.appointmentIds.findIndex((value) => value.toString() === id);
  const position = emergencyIndex >= 0 ? emergencyIndex + 1 : normalIndex >= 0 ? queue.emergencyQueue.length + normalIndex + 1 : null;
  if (position === null) return { position: null, waitTime: null, patientsAhead: 0 };
  const patientsAhead = position - 1;
  const waitTime = patientsAhead * identity.averageConsultationTime;
  return { position, waitTime, estimatedWaitTime: waitTime, patientsAhead, currentToken: queue.currentToken, waitingCount: waitingCount(queue), timezone: identity.timezone };
};

export const claimNextQueuedAppointment = async ({ doctorId, clinicId, localDate }) => {
  let queue = await Queue.findOneAndUpdate(
    {
      doctorId, clinicId, localDate, "emergencyQueue.0": { $exists: true },
      $or: [{ consecutiveEmergencyCalls: { $lt: 2 } }, { consecutiveEmergencyCalls: { $exists: false } }, { "appointmentIds.0": { $exists: false } }],
    },
    [{ $set: { currentAppointmentId: { $arrayElemAt: ["$emergencyQueue", 0] }, emergencyQueue: { $slice: ["$emergencyQueue", 1, { $size: "$emergencyQueue" }] }, consecutiveEmergencyCalls: { $add: [{ $ifNull: ["$consecutiveEmergencyCalls", 0] }, 1] }, lastUpdated: "$$NOW" } }],
    { new: true, sanitizeFilter: false },
  );
  if (!queue) {
    queue = await Queue.findOneAndUpdate(
      { doctorId, clinicId, localDate, "appointmentIds.0": { $exists: true } },
      [{ $set: { currentAppointmentId: { $arrayElemAt: ["$appointmentIds", 0] }, appointmentIds: { $slice: ["$appointmentIds", 1, { $size: "$appointmentIds" }] }, consecutiveEmergencyCalls: 0, lastUpdated: "$$NOW" } }],
      { new: true, sanitizeFilter: false },
    );
  }
  return queue;
};
