import Queue from "../models/queue.model.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import { addToQueue, emitQueueEvents, getQueuePosition, removeFromQueue } from "../utils/queueManager.js";
import mongoose from "mongoose";

const getStartOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const populateQueue = (query) => query
    .populate({
        path: 'appointmentIds',
        populate: { path: 'patientId', select: 'name email phone profileImage gender dateOfBirth' }
    })
    .populate({
        path: 'emergencyQueue',
        populate: { path: 'patientId', select: 'name email phone profileImage gender dateOfBirth' }
    });

const canManageDoctorQueue = async (user, doctorId) => {
    if (user.role === 'admin') return true;
    if (user.role !== 'doctor') return false;
    const doctor = await Doctor.findOne({ userId: user.id });
    return doctor?._id.toString() === doctorId.toString();
};

export const joinQueue = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, error: "Appointment not found" });
        }

        if (req.user.role !== 'admin' && appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Not authorized to join this queue" });
        }

        const today = getStartOfDay();
        const appointmentDay = getStartOfDay(appointment.date);
        if (appointmentDay.getTime() !== today.getTime()) {
            return res.status(400).json({ success: false, error: "Patients can only join the queue on appointment day" });
        }

        if (['completed', 'cancelled', 'no-show'].includes(appointment.status)) {
            return res.status(400).json({ success: false, error: `Cannot join queue for a ${appointment.status} appointment` });
        }

        appointment.status = 'waiting';
        appointment.checkInTime = appointment.checkInTime || Date.now();
        await appointment.save();

        await addToQueue(appointment._id);
        const queue = await populateQueue(Queue.findOne({
            doctorId: appointment.doctorId,
            clinicId: appointment.clinicId,
            date: today,
        }));
        const stats = await getQueuePosition(appointment._id);

        res.status(200).json({
            success: true,
            message: "Joined queue successfully",
            appointment,
            queue,
            ...stats
        });
    } catch (error) {
        console.error("Join Queue Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const updateQueueStatus = async (req, res) => {
    try {
        const { appointmentId, status, notes } = req.body;
        const allowedStatuses = ['waiting', 'in-progress', 'completed', 'cancelled', 'no-show'];

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
        }
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid queue status" });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, error: "Appointment not found" });
        }

        const authorized = await canManageDoctorQueue(req.user, appointment.doctorId);
        if (!authorized) {
            return res.status(403).json({ success: false, error: "Not authorized to update this queue" });
        }

        appointment.status = status;
        if (notes !== undefined) appointment.notes = notes;
        if (status === 'waiting') {
            appointment.checkInTime = appointment.checkInTime || Date.now();
            await appointment.save();
            const queue = await addToQueue(appointment._id);
            return res.status(200).json({ success: true, appointment, queue });
        }
        if (status === 'in-progress') {
            appointment.consultationStartTime = appointment.consultationStartTime || Date.now();
        }
        if (status === 'completed') {
            appointment.consultationEndTime = appointment.consultationEndTime || Date.now();
        }

        await appointment.save();
        const queue = await removeFromQueue(appointment);
        if (queue && status === 'in-progress') emitQueueEvents(queue, appointment, "patient_called");

        res.status(200).json({
            success: true,
            message: "Queue status updated",
            appointment,
            queue
        });
    } catch (error) {
        console.error("Update Queue Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getQueuePositionForPatient = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
        }

        const appointment = await Appointment.findById(appointmentId).select('patientId doctorId');
        if (!appointment) {
            return res.status(404).json({ success: false, error: "Appointment not found" });
        }
        const isOwner = appointment.patientId.toString() === req.user.id;
        const canManage = await canManageDoctorQueue(req.user, appointment.doctorId);
        if (!isOwner && !canManage) {
            return res.status(403).json({ success: false, error: "Not authorized to view this queue position" });
        }

        const stats = await getQueuePosition(appointmentId);

        if (stats.position === null) {
            return res.status(404).json({ success: false, message: "Appointment is not currently in any active queue." });
        }

        res.status(200).json({
            success: true,
            ...stats
        });

    } catch (error) {
        console.error("Queue Position Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getTodayQueueForDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params; // Or from req.user if doctor is logged in
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ success: false, error: "Invalid Doctor ID" });
        }

        const authorized = await canManageDoctorQueue(req.user, doctorId);
        if (!authorized) {
            return res.status(403).json({ success: false, error: "Not authorized to view this queue" });
        }

        const today = getStartOfDay();

        const queue = await populateQueue(Queue.findOne({
            doctorId: doctorId,
            date: today
        }));

        if (!queue) {
             return res.status(200).json({ success: true, queue: null, message: "No queue active for today yet." }); 
        }

        res.status(200).json({
            success: true,
            queue
        });

    } catch (error) {
        console.error("Doctor Queue Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
