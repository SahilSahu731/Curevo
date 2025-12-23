import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Queue from "../models/queue.model.js";
import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";
import { getIO } from "../config/socket.js";

// Helper function to handle common Mongoose error patterns
const handleMongooseError = (res, error) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((val) => val.message);
    return res.status(400).json({ success: false, error: messages });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({ success: false, error: `Duplicate field value: ${field} already exists.` });
  }
  res.status(500).json({ success: false, error: error.message || "Server Error" });
};

export const createDoctor = async (req, res) => {
  try {
    const { 
      userId, 
      clinicId, 
      specialization, 
      qualification, 
      experience, 
      consultationFee 
    } = req.body;

    if (!userId || !clinicId) {
      return res.status(400).json({ success: false, error: "userId and clinicId are required." });
    }

    const user = await User.findById(userId);
    if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
      return res.status(400).json({ success: false, error: "User not found or does not have a valid role for a doctor profile." });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, error: "Clinic not found." });
    }

    const doctor = await Doctor.create({
      userId,
      clinicId,
      specialization,
      qualification,
      experience,
      consultationFee,
      isAvailable: true 
    });

    res.status(201).json({
      success: true,
      message: "Doctor profile created and linked successfully.",
      data: doctor,
    });

  } catch (error) {
    handleMongooseError(res, error);
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .populate({
        path: 'userId',
        select: 'name email profileImage phone',
      });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getDoctor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid Doctor ID format." });
    }

    const doctor = await Doctor.findById(req.params.id)
      .populate({
        path: 'userId',
        select: 'name email profileImage phone',
      })
      .populate({
        path: 'clinicId',
        select: 'name address phone',
      });

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor profile not found" });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor profile not found for this user." });
    }

    const allowedUpdates = ['specialization', 'qualification', 'experience', 'consultationFee'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            updates[key] = req.body[key];
        }
    });
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(doctor._id, updates, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email');

    await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        phone: req.body.phone,
        profileImage: req.body.profileImage
    }, { new: true, runValidators: true });


    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully.",
      data: updatedDoctor,
    });
  } catch (error) {
    handleMongooseError(res, error);
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor profile not found." });
    }

    const newAvailability = !doctor.isAvailable;

    doctor.isAvailable = newAvailability;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Availability updated to: ${newAvailability ? 'Available' : 'Unavailable'}`,
      data: { isAvailable: newAvailability },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

// --- Queue Management Logic ---

export const callNextPatient = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor not found" });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({
            doctorId: doctor._id,
            date: today
        }).populate('appointmentIds').populate('emergencyQueue');

        if (!queue) {
            return res.status(404).json({ success: false, error: "No active queue for today" });
        }

        // Logic to pick next patient
        let nextApptId = null;
        let isEmergency = false;

        if (queue.emergencyQueue.length > 0) {
            nextApptId = queue.emergencyQueue[0]._id; // Peek
            isEmergency = true;
        } else if (queue.appointmentIds.length > 0) {
            nextApptId = queue.appointmentIds[0]._id; // Peek
        } else {
            return res.status(200).json({ success: true, message: "Queue is empty", patient: null });
        }

        const appointment = await Appointment.findById(nextApptId).populate('patientId', 'name profileImage');
        
        // Update Appointment Status
        appointment.status = 'in-progress';
        appointment.consultationStartTime = Date.now();
        await appointment.save();

        // Update Queue: Remove from waiting list, set current token
        if (isEmergency) {
            queue.emergencyQueue.shift();
        } else {
            queue.appointmentIds.shift();
        }
        
        queue.currentToken = appointment.tokenNumber; // Update current token being served
        queue.lastUpdated = Date.now();
        await queue.save();

        // Socket Events
        const io = getIO();
        if (io) {
            // Notify Patient
            io.to(`appointment-${appointment._id}`).emit('your-turn', { appointment });
            
            // Update Clinic/Queue Boards
            io.to(`clinic-${doctor.clinicId}`).emit('queue-update', {
                queueId: queue._id,
                doctorId: doctor._id,
                currentToken: queue.currentToken,
                waitingCount: queue.appointmentIds.length + queue.emergencyQueue.length
            });
        }

        res.status(200).json({
            success: true,
            patient: appointment,
            tokenNumber: appointment.tokenNumber
        });

    } catch (error) {
        console.error("Call Next Patient Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const completeConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });

        appointment.status = 'completed';
        appointment.notes = notes;
        appointment.consultationEndTime = Date.now();
        await appointment.save();

        res.status(200).json({ success: true, message: "Consultation completed" });

    } catch (error) {
        console.error("Complete Consultation Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// --- Slot Generation Logic ---

const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ success: false, error: "Invalid Doctor ID format." });
    }
    if (!date) {
        return res.status(400).json({ success: false, error: "Date query parameter is required (YYYY-MM-DD)." });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

    const doctor = await Doctor.findById(doctorId).populate('clinicId');

    if (!doctor) {
        return res.status(404).json({ success: false, error: "Doctor not found." });
    }
    const clinic = doctor.clinicId;

    if (!clinic || !clinic.isActive) {
        return res.status(404).json({ success: false, error: "Clinic is inactive or not found." });
    }

    if (!clinic.workingDays.includes(dayOfWeek)) {
        return res.status(200).json({ success: true, message: `Clinic is closed on ${dayOfWeek}.`, data: [] });
    }

    const {
        openingTime,
        closingTime,
        averageConsultationTime,
        slotBufferMinutes,
        breakSlots
    } = clinic;

    let currentTimeMinutes = timeToMinutes(openingTime);
    const closingTimeMinutes = timeToMinutes(closingTime);
    
    const slotDuration = averageConsultationTime + (slotBufferMinutes || 0);
    const possibleSlots = [];

    while (currentTimeMinutes < closingTimeMinutes) {
        const slotEndTimeMinutes = currentTimeMinutes + averageConsultationTime;
        const totalSlotEndTimeMinutes = currentTimeMinutes + slotDuration;

        const isBreak = breakSlots.some(breakTime => {
            const breakStart = timeToMinutes(breakTime.startTime);
            const breakEnd = timeToMinutes(breakTime.endTime);
            return currentTimeMinutes < breakEnd && totalSlotEndTimeMinutes > breakStart;
        });

        if (isBreak) {
            const nextTime = Math.max(...breakSlots.map(b => timeToMinutes(b.endTime)));
            currentTimeMinutes = nextTime;
            continue; 
        }

        if (slotEndTimeMinutes > closingTimeMinutes) {
            break;
        }

        possibleSlots.push({
            time: minutesToTime(currentTimeMinutes),
            duration: averageConsultationTime,
        });

        currentTimeMinutes = totalSlotEndTimeMinutes;
    }

    // Filter booked slots
    const bookedAppointments = await Appointment.find({
        doctorId,
        date: targetDate,
        status: { $ne: 'cancelled' }
    }).select('slotTime');

    const bookedTimes = bookedAppointments.map(app => app.slotTime);

    const availableSlots = possibleSlots.map(slot => ({
        ...slot,
        isBooked: bookedTimes.includes(slot.time)
    }));

    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Could not process slot request." });
  }
};