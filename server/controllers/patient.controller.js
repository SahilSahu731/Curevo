import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import { generateToken } from "../utils/tokenGenerator.js";
import { addToQueue } from "../utils/queueManager.js";
import mongoose from "mongoose";

export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, clinicId, date, slotTime, symptoms, priority } = req.body;
        const patientId = req.user.id; // From auth middleware

        if (!doctorId || !clinicId || !date || !slotTime) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const checkDate = new Date(date);
        const existing = await Appointment.findOne({
            doctorId,
            date: checkDate,
            slotTime,
            status: { $ne: 'cancelled' }
        });

        if (existing) {
            return res.status(400).json({ success: false, error: "Slot already booked" });
        }

        const tokenNumber = await generateToken(clinicId, doctorId, checkDate);

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            clinicId,
            date: checkDate,
            slotTime,
            tokenNumber,
            symptoms,
            priority: priority || 'normal',
            status: 'booked'
        });

        const today = new Date();
        today.setHours(0,0,0,0);
        if (checkDate.getTime() === today.getTime()) {
            await addToQueue(appointment._id);
        }

        res.status(201).json({
            success: true,
            appointment,
            tokenNumber,
            message: "Appointment booked successfully"
        });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { status } = req.query;

        let query = { patientId };
        if (status) {
            if (status === 'upcoming') {
                query.date = { $gte: new Date() };
                query.status = { $nin: ['cancelled', 'completed'] };
            } else {
                query.status = status;
            }
        }

        const appointments = await Appointment.find(query)
            .populate('doctorId', 'userId')
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate('clinicId', 'name address')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error("Get Appointments Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const checkIn = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: "Appointment not found" });
        }

        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Not authorized" });
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        const apptDate = new Date(appointment.date);
        apptDate.setHours(0,0,0,0);

        if (apptDate.getTime() !== today.getTime()) {
             return res.status(400).json({ success: false, error: "Can only check-in on the day of appointment" });
        }

        appointment.status = 'waiting';
        appointment.checkInTime = Date.now();
        await appointment.save();

        await addToQueue(appointment._id);

        res.status(200).json({ success: true, message: "Checked in successfully" });

    } catch (error) {
        console.error("Check-in Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: "Appointment not found" });
        }

        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Not authorized" });
        }

        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
             return res.status(400).json({ success: false, error: "Cannot cancel completed or already cancelled appointment" });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        const today = new Date();
        today.setHours(0,0,0,0);
        const apptDate = new Date(appointment.date);
        apptDate.setHours(0,0,0,0);

        if (apptDate.getTime() === today.getTime()) {
             const Queue = mongoose.model("Queue"); // Use model getter
             await Queue.updateOne(
                { 
                    doctorId: appointment.doctorId, 
                    clinicId: appointment.clinicId, 
                    date: today 
                },
                { 
                    $pull: { appointmentIds: appointment._id, emergencyQueue: appointment._id } 
                }
            );
        }

        res.status(200).json({ success: true, message: "Appointment cancelled successfully" });

    } catch (error) {
        console.error("Cancel Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
