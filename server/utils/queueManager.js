import Queue from "../models/queue.model.js";
import Appointment from "../models/appointment.model.js";
import { getIO } from "../config/socket.js";

const idsEqual = (left, right) => left?.toString() === right?.toString();

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getWaitingCount = (queue) => queue.appointmentIds.length + queue.emergencyQueue.length;

export const emitQueueEvents = (queue, appointment = null, eventName = "queue_updated") => {
  try {
    const io = getIO();
    const payload = {
      queueId: queue._id,
      doctorId: queue.doctorId,
      clinicId: queue.clinicId,
      currentToken: queue.currentToken,
      waitingCount: getWaitingCount(queue),
      updatedAt: queue.lastUpdated,
      appointmentId: appointment?._id,
      status: appointment?.status,
    };

    io.to(`clinic-${queue.clinicId}`).emit("queue_updated", payload);
    io.to(`doctor-${queue.doctorId}`).emit("queue_updated", payload);
    io.to(`clinic-${queue.clinicId}`).emit("queue-update", payload);
    io.to(`doctor-${queue.doctorId}`).emit("queue-update", payload);

    if (appointment) {
      io.to(`appointment-${appointment._id}`).emit(eventName, payload);
      if (eventName === "patient_called") {
        io.to(`appointment-${appointment._id}`).emit("your-turn", { appointment });
      }
    }
  } catch (error) {
    console.warn("Queue socket emit skipped:", error.message);
  }
};

export const addToQueue = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    const today = getStartOfDay();

    let queue = await Queue.findOne({
      doctorId: appointment.doctorId,
      clinicId: appointment.clinicId,
      date: today,
    });

    if (!queue) {
      queue = await Queue.create({
        doctorId: appointment.doctorId,
        clinicId: appointment.clinicId,
        date: today,
        currentToken: 0,
        appointmentIds: [],
        emergencyQueue: [],
      });
    }

    // Add to appropriate array based on priority
    if (appointment.priority === 'emergency') {
        if (!queue.emergencyQueue.some((id) => idsEqual(id, appointmentId))) {
            queue.emergencyQueue.push(appointmentId);
        }
    } else {
        if (!queue.appointmentIds.some((id) => idsEqual(id, appointmentId))) {
            queue.appointmentIds.push(appointmentId);
        }
    }

    queue.lastUpdated = Date.now();
    await queue.save();

    emitQueueEvents(queue, appointment);

    return queue;
  } catch (error) {
    console.error("Queue add error:", error);
    throw error;
  }
};

export const getQueuePosition = async (appointmentId) => {
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        const today = getStartOfDay();

        const queue = await Queue.findOne({
            doctorId: appointment.doctorId,
            clinicId: appointment.clinicId,
            date: today,
        });

        if (!queue) return { position: null, waitTime: null, patientsAhead: 0 };

        let position = -1;
        let isEmergency = false;

        // Check emergency queue first
        const emergencyIndex = queue.emergencyQueue.findIndex((id) => idsEqual(id, appointmentId));
        if (emergencyIndex !== -1) {
            position = emergencyIndex + 1; // 1-based index
            isEmergency = true;
        } else {
             // Check normal queue
            const normalIndex = queue.appointmentIds.findIndex((id) => idsEqual(id, appointmentId));
            if (normalIndex !== -1) {
                position = queue.emergencyQueue.length + normalIndex + 1;
            }
        }
        
        if (position === -1) return { position: null, waitTime: null, patientsAhead: 0 };

        // Simple wait time calculation (e.g., 15 mins per patient)
        // Ideally should fetch doctor's avg consultation time
        const AVG_TIME = 15; 
        const patientsAhead = position - 1; // Incorrect if currentToken is advanced.
        
        // Correct logic: find effective position relative to currentToken
        // Wait, 'position' above is absolute in the list.
        // We need to know how many people are efficiently ahead.
        // Since we don't remove people from the list immediately usually, or we use currentToken to track index.
        // logic:
        // The queue lists ALL pending appointments for the day? Or just waiting ones?
        // Usually, 'appointmentIds' contains IDs of people WAITING.
        // If we remove them when done, then position is just index + 1.
        
        // Assuming currentToken logic:
        // currentToken implies token number being served.
        // But here we are using lists of IDs.
        
        // Revised Logic: 
        // queue.appointmentIds should list people waiting.
        // When doctor calls next, we shift/remove from this list or mark them somewhere.
        // Let's assume queue.appointmentIds is the dynamic waiting list.
        
        const waitTime = patientsAhead * AVG_TIME;

        return {
            position,
            waitTime,
            patientsAhead,
            currentToken: queue.currentToken,
            waitingCount: getWaitingCount(queue),
            estimatedWaitTime: waitTime,
        };

    } catch (error) {
        console.error("Get Position Error:", error);
        throw error;
    }
}

export const removeFromQueue = async (appointment) => {
  const today = getStartOfDay();
  const queue = await Queue.findOne({
    doctorId: appointment.doctorId,
    clinicId: appointment.clinicId,
    date: today,
  });

  if (!queue) return null;

  queue.appointmentIds = queue.appointmentIds.filter((id) => !idsEqual(id, appointment._id));
  queue.emergencyQueue = queue.emergencyQueue.filter((id) => !idsEqual(id, appointment._id));
  queue.lastUpdated = Date.now();
  await queue.save();
  emitQueueEvents(queue, appointment);
  return queue;
};
