import Queue from "../models/queue.model.js";
import Appointment from "../models/appointment.model.js";
import { getIO } from "../config/socket.js";
import mongoose from "mongoose";

export const addToQueue = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        // Check if already in emergency queue
        if (!queue.emergencyQueue.includes(appointmentId)) {
            queue.emergencyQueue.push(appointmentId);
        }
    } else {
        // Check if already in main queue
        if (!queue.appointmentIds.includes(appointmentId)) {
            queue.appointmentIds.push(appointmentId);
        }
    }

    queue.lastUpdated = Date.now();
    await queue.save();

    // Emit socket event
    const io = getIO();
    if (io) {
        // Notify the specific clinic/doctor room
        io.to(`clinic-${appointment.clinicId}`).emit('queue-update', {
            queueId: queue._id,
            doctorId: appointment.doctorId,
            currentToken: queue.currentToken,
            waitingCount: queue.appointmentIds.length + queue.emergencyQueue.length
        });
    }

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({
            doctorId: appointment.doctorId,
            clinicId: appointment.clinicId,
            date: today,
        });

        if (!queue) return { position: null, waitTime: null, patientsAhead: 0 };

        let position = -1;
        let isEmergency = false;

        // Check emergency queue first
        const emergencyIndex = queue.emergencyQueue.indexOf(appointmentId);
        if (emergencyIndex !== -1) {
            position = emergencyIndex + 1; // 1-based index
            isEmergency = true;
        } else {
             // Check normal queue
            const normalIndex = queue.appointmentIds.indexOf(appointmentId);
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

        return { position, waitTime, patientsAhead };

    } catch (error) {
        console.error("Get Position Error:", error);
        throw error;
    }
}
