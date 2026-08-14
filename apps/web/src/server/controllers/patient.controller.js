import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";
import Clinic from "../models/clinic.model.js";
import { addToQueue, removeFromQueue } from "../utils/queueManager.js";
import { reserveAndBook, releaseAppointmentSlot } from "../services/booking.service.js";
import { transitionAppointment } from "../services/appointmentState.service.js";
import { localDateInTimezone } from "../utils/scheduling.js";
import { notifyAppointment } from "../services/notification.service.js";

const getStartOfDay = (value = new Date()) => {
    const dateValue = new Date(value);
    dateValue.setHours(0, 0, 0, 0);
    return dateValue;
};

const getEndOfDay = (value = new Date()) => {
    const dateValue = new Date(value);
    dateValue.setHours(23, 59, 59, 999);
    return dateValue;
};

export const bookAppointment = async (req, res) => {
    try {
        req.body.priority = "normal";
        const result = await reserveAndBook({ patientId: req.user.id, payload: req.body, idempotencyKey: req.get("Idempotency-Key") });
        const appointment = result.appointment;
        await notifyAppointment({ appointment, type: "booking-confirmation" });
        if (appointment.consultationType === "video") await notifyAppointment({ appointment, type: "telehealth-ready" });

        res.status(result.replayed ? 200 : 201).json({
            success: true,
            appointment,
            tokenNumber: appointment.tokenNumber,
            replayed: result.replayed,
            message: result.replayed ? "Original booking returned" : "Appointment booked successfully"
        });

    } catch (error) {
        if (!error.statusCode || error.statusCode >= 500) console.error("Booking Error:", error.message);
        res.status(error.statusCode || 500).json({ success: false, error: error.message || "Server Error" });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { status } = req.query;

        let query = { patientId };
        if (status) {
            if (status === 'upcoming') {
                query.date = mongoose.trusted({ $gte: new Date() });
                query.status = mongoose.trusted({ $nin: ['cancelled', 'completed'] });
            } else {
                query.status = status;
            }
        }

        const appointments = await Appointment.find(query).setOptions({ sanitizeFilter: false })
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

        const timezone = appointment.clinicTimezone || "Asia/Kolkata";
        const appointmentDay = localDateInTimezone(appointment.slotStartUtc || appointment.date, timezone);
        if (appointmentDay !== localDateInTimezone(new Date(), timezone)) {
             return res.status(400).json({ success: false, error: "Can only check-in on the day of appointment" });
        }
        const clinic = await Clinic.findById(appointment.clinicId).select("checkInOpensMinutesBefore checkInClosesMinutesAfter");
        const start = new Date(appointment.slotStartUtc || appointment.date).getTime();
        if (Date.now() < start - (clinic?.checkInOpensMinutesBefore ?? 60) * 60_000 || Date.now() > start + (clinic?.checkInClosesMinutesAfter ?? 60) * 60_000) {
            return res.status(409).json({ success: false, error: "Check-in is outside the clinic's allowed window" });
        }
        const result = await transitionAppointment({ appointment, to: "waiting", actor: req.user });
        await addToQueue(result.appointment._id);
        await notifyAppointment({ appointment: result.appointment, type: "check-in-open" });

        res.status(200).json({ success: true, message: "Checked in successfully" });

    } catch (error) {
        if (!error.statusCode) console.error("Check-in Error:", error.message);
        res.status(error.statusCode || 500).json({ success: false, error: error.statusCode ? error.message : "Server Error" });
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

        if (appointment.slotStartUtc) {
            const clinic = await Clinic.findById(appointment.clinicId).select("cancellationNoticeHours");
            const cutoff = new Date(appointment.slotStartUtc).getTime() - (clinic?.cancellationNoticeHours || 0) * 60 * 60_000;
            if (Date.now() > cutoff) return res.status(409).json({ success: false, error: "Cancellation window has closed; contact the clinic" });
        }

        const result = await transitionAppointment({ appointment, to: "cancelled", actor: req.user, reason: req.body?.reason });
        await removeFromQueue(result.appointment);
        await releaseAppointmentSlot(result.appointment._id);
        await notifyAppointment({ appointment: result.appointment, type: "appointment-cancelled" });

        res.status(200).json({ success: true, message: "Appointment cancelled successfully" });

    } catch (error) {
        if (!error.statusCode) console.error("Cancel Error:", error.message);
        res.status(error.statusCode || 500).json({ success: false, error: error.statusCode ? error.message : "Server Error" });
    }
};
