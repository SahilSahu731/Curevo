import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Queue from "../models/queue.model.js";
import Appointment from "../models/appointment.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import Review from "../models/review.model.js";
import mongoose from "mongoose";
import { getIO } from "../config/socket.js";
import { removeFromQueue } from "../utils/queueManager.js";

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

const getStartOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getEndOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
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
    const { 
        search, 
        specialization, 
        minFee, 
        maxFee, 
        sort, 
        gender,
        minExperience,
        location,
        minRating
    } = req.query;

    const query = {};

    // 1. Filter by Doctor-specific fields
    if (specialization) {
        // Case-insensitive regex for flexibility
        query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (minFee || maxFee) {
        query.consultationFee = {};
        if (minFee) query.consultationFee.$gte = Number(minFee);
        if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    if (minExperience) {
        query.experience = { $gte: Number(minExperience) };
    }

    if (location) {
        const matchingClinics = await Clinic.find({
            $or: [
                { name: { $regex: location, $options: 'i' } },
                { city: { $regex: location, $options: 'i' } },
                { state: { $regex: location, $options: 'i' } },
                { zipCode: { $regex: location, $options: 'i' } },
                { address: { $regex: location, $options: 'i' } },
            ]
        }).select('_id');
        query.clinicId = { $in: matchingClinics.map((clinic) => clinic._id) };
    }

    // 2. Filter by User-specific fields (Name, Gender)
    if (search || gender) {
        const userQuery = {};
        if (search) {
            userQuery.name = { $regex: search, $options: 'i' };
        }
        if (gender) {
            userQuery.gender = gender; // Expect exact match for enum
        }

        const matchingUsers = await User.find(userQuery).select('_id');
        const userIds = matchingUsers.map(u => u._id);
        
        // Add to main query
        query.userId = { $in: userIds };
    }

    // 3. Prepare Sort Options
    let sortOptions = {};
    if (sort) {
        switch (sort) {
            case 'fee_asc':
                sortOptions.consultationFee = 1;
                break;
            case 'fee_desc':
                sortOptions.consultationFee = -1;
                break;
            case 'experience_desc':
                sortOptions.experience = -1;
                break;
            case 'experience_asc':
                sortOptions.experience = 1;
                break;
            default:
                sortOptions.createdAt = -1;
        }
    } else {
        sortOptions.createdAt = -1; // Default new
    }

    let doctors = await Doctor.find(query)
      .select('-verification -currentPatient -blockedSlots')
      .populate({
        path: 'userId',
        select: 'name profileImage gender',
      })
      .populate({
        path: 'clinicId',
        select: 'name address city'
      })
      .sort(sortOptions);

    const reviewStats = await Review.aggregate([
        { $match: { doctorId: { $in: doctors.map((doctor) => doctor._id) } } },
        { $group: { _id: '$doctorId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);
    const statsByDoctor = new Map(reviewStats.map((stat) => [stat._id.toString(), stat]));

    doctors = doctors.map((doctor) => {
        const doctorObject = doctor.toObject();
        const stats = statsByDoctor.get(doctor._id.toString());
        doctorObject.ratingStats = {
            averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
            reviewCount: stats?.reviewCount || 0,
        };
        return doctorObject;
    });

    if (minRating) {
        doctors = doctors.filter((doctor) => doctor.ratingStats.averageRating >= Number(minRating));
    }

    if (sort === 'rating_desc') {
        doctors.sort((a, b) => b.ratingStats.averageRating - a.ratingStats.averageRating);
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getDoctor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid Doctor ID format." });
    }

    const doctor = await Doctor.findById(req.params.id)
      .select('-verification -currentPatient -blockedSlots')
      .populate({
        path: 'userId',
        select: 'name email profileImage phone bio',
      })
      .populate({
        path: 'clinicId',
        select: 'name address city state phone',
      });

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor profile not found" });
    }

    const stats = await Review.aggregate([
      { $match: { doctorId: doctor._id } },
      { $group: { _id: '$doctorId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);

    const completedConsultations = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'completed',
    });

    const data = doctor.toObject();
    data.ratingStats = {
      averageRating: stats[0] ? Number(stats[0].averageRating.toFixed(1)) : 0,
      reviewCount: stats[0]?.reviewCount || 0,
    };
    data.completedConsultations = completedConsultations;

    res.status(200).json({
      success: true,
      data,
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

        doctor.currentPatient = appointment._id;
        await doctor.save();

        // Socket Events
        const io = getIO();
        if (io) {
            // Notify Patient
            io.to(`appointment-${appointment._id}`).emit('your-turn', { appointment });
            io.to(`appointment-${appointment._id}`).emit('patient_called', { appointment });
            
            // Update Clinic/Queue Boards
            const payload = {
                queueId: queue._id,
                doctorId: doctor._id,
                clinicId: doctor.clinicId,
                currentToken: queue.currentToken,
                waitingCount: queue.appointmentIds.length + queue.emergencyQueue.length
            };
            io.to(`clinic-${doctor.clinicId}`).emit('queue-update', payload);
            io.to(`doctor-${doctor._id}`).emit('queue-update', payload);
            io.to(`clinic-${doctor.clinicId}`).emit('queue_updated', payload);
            io.to(`doctor-${doctor._id}`).emit('queue_updated', payload);
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
        const { notes, diagnosis, prescription, prescriptionText, treatmentPlan, followUpDate } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });

        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });
        if (appointment.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, error: "Not authorized for this appointment" });
        }

        appointment.status = 'completed';
        appointment.notes = notes;
        appointment.consultationEndTime = Date.now();
        await appointment.save();

        let medicalRecord = null;
        if (diagnosis?.trim()) {
            medicalRecord = await MedicalRecord.findOneAndUpdate(
                { appointmentId: appointment._id },
                {
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    appointmentId: appointment._id,
                    diagnosis,
                    symptoms: appointment.symptoms,
                    prescription: Array.isArray(prescription)
                        ? prescription
                        : (prescriptionText || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
                            const [medicine, dosage = '', frequency = '', duration = '', instructions = ''] = line.split('|').map((part) => part.trim());
                            return { medicine, dosage, frequency, duration, instructions };
                        }),
                    treatmentPlan,
                    doctorNotes: notes,
                    followUpDate: followUpDate || undefined,
                },
                { new: true, upsert: true, runValidators: true }
            );
        }

        if (doctor?.currentPatient?.toString() === appointment._id.toString()) {
            doctor.currentPatient = null;
            await doctor.save();
        }

        res.status(200).json({ success: true, message: "Consultation completed", medicalRecord });

    } catch (error) {
        console.error("Complete Consultation Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const submitVerification = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).select('+verification.licenseFilePublicId +verification.licenseFileResourceType +verification.licenseFileFormat');
    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor profile not found." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Medical license file is required." });
    }

    const { licenseNumber } = req.body;
    if (!licenseNumber?.trim()) {
      return res.status(400).json({ success: false, error: "License number is required." });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const cloudinary = (await import("../config/cloudinary.js")).default;
    if (doctor.verification?.licenseFilePublicId) {
      await cloudinary.uploader.destroy(doctor.verification.licenseFilePublicId, {
        resource_type: doctor.verification.licenseFileResourceType || 'image',
        type: 'authenticated',
        invalidate: true,
      });
    }
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "curevo/licenses",
      resource_type: "auto",
      type: "authenticated",
    });

    doctor.verification = {
      status: "pending",
      licenseNumber: licenseNumber.trim(),
      licenseFileUrl: undefined,
      licenseFilePublicId: result.public_id,
      licenseFileResourceType: result.resource_type,
      licenseFileFormat: result.format,
      submittedAt: new Date(),
      notes: "",
    };
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Medical license submitted for verification.",
      data: doctor.verification,
    });
  } catch (error) {
    console.error("Verification Upload Error:", error);
    res.status(500).json({ success: false, error: "Verification upload failed" });
  }
};

export const getMyVerification = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).select("verification");
    if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found." });
    res.status(200).json({ success: true, data: doctor.verification });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const markPatientAbsent = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
        if (appointment.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, error: "Not authorized for this appointment" });
        }

        appointment.status = 'no-show';
        await appointment.save();
        await removeFromQueue(appointment);

        if (doctor.currentPatient?.toString() === appointment._id.toString()) {
            doctor.currentPatient = null;
            await doctor.save();
        }

        res.status(200).json({ success: true, message: "Patient marked absent", appointment });
    } catch (error) {
        console.error("Mark Absent Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id })
            .populate('clinicId', 'workingDays openingTime closingTime averageConsultationTime');
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });

        res.status(200).json({
            success: true,
            data: {
                availability: doctor.availability || {},
                blockedSlots: doctor.blockedSlots || [],
                clinicDefaults: doctor.clinicId
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const updateAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });

        const { availability, blockedSlots } = req.body;
        if (availability) {
            doctor.availability = {
                days: availability.days,
                startTime: availability.startTime,
                endTime: availability.endTime,
                slotDuration: availability.slotDuration,
            };
        }
        if (Array.isArray(blockedSlots)) {
            doctor.blockedSlots = blockedSlots.map((slot) => ({
                date: getStartOfDay(slot.date),
                startTime: slot.startTime,
                endTime: slot.endTime,
                reason: slot.reason || '',
            }));
        }

        await doctor.save();
        res.status(200).json({ success: true, message: "Availability updated", data: doctor });
    } catch (error) {
        handleMongooseError(res, error);
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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, error: "Date must use YYYY-MM-DD format." });
    }

    const targetDate = new Date(date);
    if (Number.isNaN(targetDate.getTime())) {
        return res.status(400).json({ success: false, error: "Invalid date." });
    }
    const today = getStartOfDay();
    const latestAllowed = getStartOfDay();
    latestAllowed.setDate(latestAllowed.getDate() + 180);
    if (targetDate < today || targetDate > latestAllowed) {
        return res.status(400).json({ success: false, error: "Date must be within the next 180 days." });
    }
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

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

    const workingDays = doctor.availability?.days?.length ? doctor.availability.days : clinic.workingDays;
    if (!workingDays.includes(dayOfWeek)) {
        return res.status(200).json({ success: true, message: `Doctor is unavailable on ${dayOfWeek}.`, data: [] });
    }
    if (doctor.verification?.status !== 'approved' || !doctor.isAvailable) {
        return res.status(409).json({ success: false, error: "This clinician is not currently eligible for booking." });
    }

    const effectiveStartTime = doctor.availability?.startTime || openingTime;
    const effectiveEndTime = doctor.availability?.endTime || closingTime;
    const effectiveDuration = doctor.availability?.slotDuration || averageConsultationTime;

    let currentTimeMinutes = timeToMinutes(effectiveStartTime);
    const closingTimeMinutes = timeToMinutes(effectiveEndTime);
    
    const slotDuration = effectiveDuration + (slotBufferMinutes || 0);
    const possibleSlots = [];

    while (currentTimeMinutes < closingTimeMinutes) {
        const slotEndTimeMinutes = currentTimeMinutes + effectiveDuration;
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
            duration: effectiveDuration,
        });

        currentTimeMinutes = totalSlotEndTimeMinutes;
    }

    // Filter booked slots using a range to cover the entire day (UTC)
    const startOfDay = getStartOfDay(date);
    const endOfDay = getEndOfDay(date);

    const bookedAppointments = await Appointment.find({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled', 'no-show'] }
    }).select('slotTime');

    const bookedTimes = bookedAppointments.map(app => app.slotTime);
    const blockedForDay = (doctor.blockedSlots || []).filter((blockedSlot) => {
        const blockedDate = getStartOfDay(blockedSlot.date);
        return blockedDate.getTime() === startOfDay.getTime();
    });

    const availableSlots = possibleSlots.map(slot => {
        const slotStart = timeToMinutes(slot.time);
        const slotEnd = slotStart + slot.duration;
        const blockedSlot = blockedForDay.find((blocked) => (
            slotStart < timeToMinutes(blocked.endTime) && slotEnd > timeToMinutes(blocked.startTime)
        ));

        return {
            ...slot,
            isBooked: bookedTimes.includes(slot.time) || Boolean(blockedSlot),
            isBlocked: Boolean(blockedSlot),
            blockReason: blockedSlot?.reason,
        };
    });

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

export const deleteDoctor = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: "Invalid Doctor ID format." });
        }

        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({ success: false, error: "Doctor not found" });
        }

        // Optionally, one might want to cascadingly delete or unlink related User/Appointments
        // For now, we just remove the Doctor profile, leaving the User intact (maybe they revert to patient)
        
        res.status(200).json({
            success: true,
            data: {},
            message: "Doctor profile deleted successfully"
        });
    } catch (error) {
        handleMongooseError(res, error);
    }
};

export const updateDoctor = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, error: "Invalid Doctor ID format." });
      }

      // Allowed fields for admin to update on the Doctor model
      const allowedUpdates = ['specialization', 'qualification', 'experience', 'consultationFee', 'isAvailable', 'clinicId'];
      const updates = {};
      
      Object.keys(req.body).forEach(key => {
          if (allowedUpdates.includes(key)) {
              updates[key] = req.body[key];
          }
      });
      
      const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).populate('userId', 'name email').populate('clinicId', 'name');
  
      if (!updatedDoctor) {
        return res.status(404).json({ success: false, error: "Doctor not found." });
      }
  
      res.status(200).json({
        success: true,
        message: "Doctor updated successfully.",
        data: updatedDoctor,
      });
    } catch (error) {
      handleMongooseError(res, error);
    }
  };

export const getDoctorAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) {
            return res.status(404).json({ success: false, error: "Doctor profile not found" });
        }

        const { date, status } = req.query;
        let query = { doctorId: doctor._id };

        if (date) {
            const queryDate = new Date(date);
            const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email phone profileImage gender age') // Populate patient details
            .sort({ date: 1, tokenNumber: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error("Get Doctor Appointments Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
