import Queue from "../models/queue.model.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import { addToQueue, emitQueueEvents, getQueuePosition, removeFromQueue } from "../utils/queueManager.js";
import mongoose from "mongoose";
import { transitionAppointment } from "../services/appointmentState.service.js";
import { localDateInTimezone } from "../utils/scheduling.js";
import { notifyAppointment } from "../services/notification.service.js";
import Clinic from "../models/clinic.model.js";

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

        const timezone = appointment.clinicTimezone || "Asia/Kolkata";
        const today = localDateInTimezone(new Date(), timezone);
        const appointmentDay = localDateInTimezone(appointment.slotStartUtc || appointment.date, timezone);
        if (appointmentDay !== today) {
            return res.status(400).json({ success: false, error: "Patients can only join the queue on appointment day" });
        }
        const clinic = await Clinic.findById(appointment.clinicId).select("checkInOpensMinutesBefore checkInClosesMinutesAfter");
        const start = new Date(appointment.slotStartUtc || appointment.date).getTime();
        const opens = start - (clinic?.checkInOpensMinutesBefore ?? 60) * 60_000;
        const closes = start + (clinic?.checkInClosesMinutesAfter ?? 60) * 60_000;
        if (Date.now() < opens || Date.now() > closes) return res.status(409).json({ success: false, error: "Check-in is outside the clinic's allowed window" });

        if (['completed', 'cancelled', 'no-show'].includes(appointment.status)) {
            return res.status(400).json({ success: false, error: `Cannot join queue for a ${appointment.status} appointment` });
        }

        const transition = await transitionAppointment({ appointment, to: "waiting", actor: req.user });
        await addToQueue(transition.appointment._id);
        await notifyAppointment({ appointment: transition.appointment, type: "check-in-open" });
        const queue = await populateQueue(Queue.findOne({
            doctorId: appointment.doctorId,
            clinicId: appointment.clinicId,
            localDate: today,
        }));
        const stats = await getQueuePosition(appointment._id);

        res.status(200).json({
            success: true,
            message: "Joined queue successfully",
            appointment: transition.appointment,
            queue,
            ...stats
        });
    } catch (error) {
        if (!error.statusCode) console.error("Join Queue Error:", error.message);
        res.status(error.statusCode || 500).json({ success: false, error: error.statusCode ? error.message : "Server Error" });
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

        if (notes !== undefined) appointment.notes = notes;
        if (status === 'waiting') {
            await appointment.save();
        }
        const result = await transitionAppointment({ appointment, to: status, actor: req.user, reason: req.body.reason });
        const queue = status === "waiting" ? await addToQueue(result.appointment._id) : await removeFromQueue(result.appointment);
        if (queue && status === 'in-progress') emitQueueEvents(queue, result.appointment, "patient_called");
        if (status === "in-progress") await notifyAppointment({ appointment: result.appointment, type: "turn-now" });
        if (status === "completed") await notifyAppointment({ appointment: result.appointment, type: "appointment-completed" });
        if (status === "cancelled") await notifyAppointment({ appointment: result.appointment, type: "appointment-cancelled" });

        res.status(200).json({
            success: true,
            message: "Queue status updated",
            appointment: result.appointment,
            queue
        });
    } catch (error) {
        if (!error.statusCode) console.error("Update Queue Error:", error.message);
        res.status(error.statusCode || 500).json({ success: false, error: error.statusCode ? error.message : "Server Error" });
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

        const sample = await Appointment.findOne({ doctorId }).select("clinicTimezone").sort({ slotStartUtc: -1 }).lean();
        const timezone = sample?.clinicTimezone || "Asia/Kolkata";
        const today = localDateInTimezone(new Date(), timezone);

        const queue = await populateQueue(Queue.findOne({
            doctorId: doctorId,
            localDate: today
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
