import Queue from "../models/queue.model.js";
import Appointment from "../models/appointment.model.js";
import { getQueuePosition } from "../utils/queueManager.js";
import mongoose from "mongoose";

export const getQueuePositionForPatient = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
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
        // Ideally verify req.user.role is doctor or admin or the user themselves

        const today = new Date();
        today.setHours(0,0,0,0);

        const queue = await Queue.findOne({
            doctorId: doctorId,
            date: today
        }).populate('appointmentIds').populate('emergencyQueue');

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
