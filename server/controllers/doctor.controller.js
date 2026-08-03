import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import ClinicalNote from "../models/clinicalNote.model.js";
import { writeAuditEvent } from "../utils/audit.js";
import Review from "../models/review.model.js";
import mongoose from "mongoose";
import { claimNextQueuedAppointment, emitQueueEvents, removeFromQueue } from "../utils/queueManager.js";
import { getDoctorOnboardingState, isDoctorBookable, listAvailableSlots, localDateInTimezone, localDayRangeUtc, normalizeTime } from "../utils/scheduling.js";
import { transitionAppointment } from "../services/appointmentState.service.js";
import { notifyAppointment } from "../services/notification.service.js";

// Helper function to handle common Mongoose error patterns
const handleMongooseError = (res, error) => {
  if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
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
      clinicId,
      specialization, 
      qualification, 
      experience, 
      consultationFee 
    } = req.body;

    const userId = req.user.role === "admin" ? req.body.userId : req.user.id;
    if (!userId || !clinicId) {
      return res.status(400).json({ success: false, error: "clinicId is required." });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
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
      isAvailable: false,
      verification: { status: "not-submitted" },
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

    const activeUsers = await User.find({ status: "active", role: "doctor" }).select("_id").lean();
    const activeClinics = await Clinic.find({ isActive: true }).select("_id").lean();
    const query = {
      userId: mongoose.trusted({ $in: activeUsers.map(({ _id }) => _id) }),
      clinicId: mongoose.trusted({ $in: activeClinics.map(({ _id }) => _id) }),
      isAvailable: true,
      "verification.status": "approved",
      $and: [
        { $or: [{ "verification.expiresAt": mongoose.trusted({ $exists: false }) }, { "verification.expiresAt": null }, { "verification.expiresAt": mongoose.trusted({ $gt: new Date() }) }] },
        { $or: [{ "verification.licenseFilePublicId": mongoose.trusted({ $exists: true }) }, { "verification.licenseFileUrl": mongoose.trusted({ $exists: true }) }] },
      ],
    };

    // 1. Filter by Doctor-specific fields
    if (specialization) {
        // Case-insensitive regex for flexibility
        query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (minFee || maxFee) {
        query.consultationFee = mongoose.trusted({});
        if (minFee) query.consultationFee.$gte = Number(minFee);
        if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    if (minExperience) {
        query.experience = mongoose.trusted({ $gte: Number(minExperience) });
    }

    if (location) {
        const matchingClinics = await Clinic.find({
            $or: [
                { name: mongoose.trusted({ $regex: location, $options: 'i' }) },
                { city: mongoose.trusted({ $regex: location, $options: 'i' }) },
                { state: mongoose.trusted({ $regex: location, $options: 'i' }) },
                { zipCode: mongoose.trusted({ $regex: location, $options: 'i' }) },
                { address: mongoose.trusted({ $regex: location, $options: 'i' }) },
            ]
        }).setOptions({ sanitizeFilter: false }).select('_id');
        const activeIds = new Set(activeClinics.map((clinic) => clinic._id.toString()));
        query.clinicId = mongoose.trusted({ $in: matchingClinics.filter((clinic) => activeIds.has(clinic._id.toString())).map((clinic) => clinic._id) });
    }

    // 2. Filter by User-specific fields (Name, Gender)
    if (search || gender) {
        const userQuery = {};
        if (search) {
            userQuery.name = mongoose.trusted({ $regex: search, $options: 'i' });
        }
        if (gender) {
            userQuery.gender = gender; // Expect exact match for enum
        }

        const matchingUsers = await User.find(userQuery).select('_id');
        const userIds = matchingUsers.map(u => u._id);
        
        // Add to main query
        const activeIds = new Set(activeUsers.map((user) => user._id.toString()));
        query.userId = mongoose.trusted({ $in: userIds.filter((id) => activeIds.has(id.toString())) });
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

    let doctors = await Doctor.find(query).setOptions({ sanitizeFilter: false })
      .select('userId clinicId specialization qualification experience consultationFee isAvailable availability createdAt updatedAt isSynthetic')
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
        { $match: { doctorId: { $in: doctors.map((doctor) => doctor._id) }, status: 'published' } },
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

    const doctor = await Doctor.findOne({
      _id: req.params.id,
      isAvailable: true,
      "verification.status": "approved",
      $or: [{ "verification.expiresAt": mongoose.trusted({ $exists: false }) }, { "verification.expiresAt": null }, { "verification.expiresAt": mongoose.trusted({ $gt: new Date() }) }],
    }).setOptions({ sanitizeFilter: false })
      .select('userId clinicId specialization qualification experience consultationFee isAvailable availability createdAt updatedAt isSynthetic')
      .populate({
        path: 'userId',
        select: 'name email profileImage phone bio status',
      })
      .populate({
        path: 'clinicId',
        select: 'name address city state phone isActive timezone',
      });

    if (!doctor || doctor.userId?.status !== "active" || !doctor.clinicId?.isActive) {
      return res.status(404).json({ success: false, error: "Doctor profile not found" });
    }

    const stats = await Review.aggregate([
      { $match: { doctorId: doctor._id, status: 'published' } },
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
    const doctor = await Doctor.findOne({ userId: req.user.id }).select('+verification.history');

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
    
    const requiresReview = doctor.verification?.status === "approved" && ['specialization', 'qualification', 'experience'].some((key) => updates[key] !== undefined && String(updates[key]) !== String(doctor[key]));
    Object.assign(doctor, updates);
    if (requiresReview) {
      doctor.verification.history.push({ from: "approved", to: "pending", reason: "Material clinician profile change", actorUserId: req.user._id });
      doctor.verification.status = "pending";
      doctor.verification.submittedAt = new Date();
      doctor.isAvailable = false;
    }
    await doctor.save();
    const updatedDoctor = await Doctor.findById(doctor._id).populate('userId', 'name email');

    await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        phone: req.body.phone,
        profileImage: req.body.profileImage
    }, { new: true, runValidators: true });
    if (requiresReview) await writeAuditEvent(req, "doctor-profile-reverification", "success", { metadata: { doctorId: doctor._id.toString() } });


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

    const clinic = await Clinic.findById(doctor.clinicId);
    const newAvailability = !doctor.isAvailable;
    if (newAvailability && !isDoctorBookable({ ...doctor.toObject(), isAvailable: true }, clinic)) {
      return res.status(409).json({ success: false, error: "Complete verification and keep an active license before accepting bookings" });
    }

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
        const clinic = await Clinic.findById(doctor.clinicId).select("timezone");
        const localDate = localDateInTimezone(new Date(), clinic?.timezone || "Asia/Kolkata");
        const queue = await claimNextQueuedAppointment({ doctorId: doctor._id, clinicId: doctor.clinicId, localDate });
        if (!queue?.currentAppointmentId) return res.status(200).json({ success: true, message: "Queue is empty", patient: null });

        const selected = await Appointment.findById(queue.currentAppointmentId);
        if (!selected) return res.status(409).json({ success: false, error: "Queued appointment no longer exists" });
        let appointment;
        try {
          ({ appointment } = await transitionAppointment({ appointment: selected, to: "in-progress", actor: req.user }));
        } catch (error) {
          return res.status(error.statusCode || 409).json({ success: false, error: error.message });
        }
        queue.currentToken = appointment.tokenNumber;
        queue.lastUpdated = new Date();
        await queue.save();
        await Doctor.updateOne({ _id: doctor._id }, { $set: { currentPatient: appointment._id } });
        emitQueueEvents(queue, appointment, "patient_called");
        await notifyAppointment({ appointment, type: "turn-now" });
        const approachingId = queue.emergencyQueue?.[0] || queue.appointmentIds?.[0];
        if (approachingId) {
          const approaching = await Appointment.findById(approachingId).select("patientId");
          if (approaching) await notifyAppointment({ appointment: approaching, type: "turn-approaching", suffix: String(queue.currentToken) });
        }
        await appointment.populate('patientId', 'name profileImage');

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

        let appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });

        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });
        if (appointment.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, error: "Not authorized for this appointment" });
        }
        const existingRecordBeforeCompletion = await MedicalRecord.findOne({ appointmentId: appointment._id }).select("finalizedAt").lean();
        if (existingRecordBeforeCompletion?.finalizedAt) return res.status(409).json({ success: false, error: "This clinical record is finalized; add an addendum instead" });
        const existingPrivateNoteBeforeCompletion = existingRecordBeforeCompletion ? await ClinicalNote.findOne({ medicalRecordId: existingRecordBeforeCompletion._id }).select("finalizedAt").lean() : null;
        if (existingPrivateNoteBeforeCompletion?.finalizedAt) return res.status(409).json({ success: false, error: "This private note is finalized; use an addendum" });

        appointment.notes = notes;
        await appointment.save();
        ({ appointment: appointment } = await transitionAppointment({ appointment, to: "completed", actor: req.user }));
        await notifyAppointment({ appointment, type: "appointment-completed" });

        let medicalRecord = null;
        if (diagnosis?.trim()) {
            const existingRecord = await MedicalRecord.findOne({ appointmentId: appointment._id });
            if (existingRecord?.finalizedAt) {
                return res.status(409).json({ success: false, error: "This clinical record is finalized; add an addendum instead" });
            }
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
                    patientInstructions: req.body.patientInstructions,
                    followUpDate: followUpDate || undefined,
                    authorDoctorId: doctor._id,
                    lastEditedBy: req.user._id,
                    revision: (existingRecord?.revision || 0) + 1,
                },
                { new: true, upsert: true, runValidators: true }
            );
            const privateNote = await ClinicalNote.findOne({ medicalRecordId: medicalRecord._id });
            if (privateNote?.finalizedAt) return res.status(409).json({ success: false, error: "This private note is finalized; use an addendum" });
            if (privateNote) privateNote.revisions.push({ notes: privateNote.notes, authorUserId: privateNote.authorUserId });
            const note = privateNote || new ClinicalNote({ medicalRecordId: medicalRecord._id, appointmentId: appointment._id, patientId: appointment.patientId, doctorId: doctor._id });
            note.notes = String(notes || ""); note.authorUserId = req.user._id;
            await note.save();
            await writeAuditEvent(req, "medical-record-edit", "success", { targetUserId: appointment.patientId, metadata: { recordId: medicalRecord._id.toString() } });
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
    if (doctor.verification?.status === "pending") {
      return res.status(409).json({ success: false, error: "Verification is already awaiting review" });
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

    const previousStatus = doctor.verification?.status || "not-submitted";
    const history = doctor.verification?.history || [];
    doctor.verification = {
      status: "pending",
      licenseNumber: licenseNumber.trim(),
      licenseFileUrl: undefined,
      licenseFilePublicId: result.public_id,
      licenseFileResourceType: result.resource_type,
      licenseFileFormat: result.format,
      submittedAt: new Date(),
      notes: "",
      rejectionReason: "",
      history: [...history, { from: previousStatus, to: "pending", actorUserId: req.user._id, changedAt: new Date() }],
    };
    await doctor.save();
    await writeAuditEvent(req, "license-upload", "success", { metadata: { doctorId: doctor._id.toString(), detectedType: req.file.detectedType, status: "quarantined-pending-review" } });

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
    if (!doctor) return res.status(200).json({ success: true, data: { status: "not-submitted", onboardingState: "account-created" } });
    res.status(200).json({ success: true, data: { ...doctor.verification.toObject(), onboardingState: getDoctorOnboardingState(doctor) } });
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

        const transition = await transitionAppointment({ appointment, to: "no-show", actor: req.user, reason: req.body?.reason });
        await removeFromQueue(transition.appointment);

        if (doctor.currentPatient?.toString() === appointment._id.toString()) {
            doctor.currentPatient = null;
            await doctor.save();
        }

        res.status(200).json({ success: true, message: "Patient marked absent", appointment: transition.appointment });
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
            const startTime = normalizeTime(availability.startTime);
            const endTime = normalizeTime(availability.endTime);
            if (startTime >= endTime) return res.status(400).json({ success: false, error: "Availability end time must be after start time" });
            if (!Array.isArray(availability.days) || availability.days.length === 0) return res.status(400).json({ success: false, error: "At least one working day is required" });
            if (!Number.isInteger(Number(availability.slotDuration)) || availability.slotDuration < 5 || availability.slotDuration > 240) return res.status(400).json({ success: false, error: "Slot duration must be 5-240 minutes" });
            doctor.availability = {
                days: availability.days,
                startTime,
                endTime,
                slotDuration: availability.slotDuration,
            };
        }
        if (Array.isArray(blockedSlots)) {
            doctor.blockedSlots = blockedSlots.map((slot) => {
                const startTime = normalizeTime(slot.startTime); const endTime = normalizeTime(slot.endTime);
                if (startTime >= endTime) throw Object.assign(new Error("Blocked-slot end time must be after start time"), { statusCode: 400 });
                return { date: getStartOfDay(slot.date), startTime, endTime, reason: slot.reason || '' };
            });
        }
        if (Array.isArray(req.body.leavePeriods)) {
            if (req.body.leavePeriods.some((leave) => !leave.startAt || !leave.endAt || new Date(leave.startAt) >= new Date(leave.endAt))) return res.status(400).json({ success: false, error: "Every leave period needs a valid start and end" });
            doctor.leavePeriods = req.body.leavePeriods;
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

        const doctor = await Doctor.findById(req.params.id).select("+verification.history");

        if (!doctor) {
            return res.status(404).json({ success: false, error: "Doctor not found" });
        }

        const previous = doctor.verification?.status || "not-submitted";
        doctor.isAvailable = false;
        doctor.verification.status = "suspended";
        doctor.verification.suspendedAt = new Date();
        doctor.verification.suspensionReason = String(req.body?.reason || "Administrative suspension").slice(0, 500);
        doctor.verification.history.push({ from: previous, to: "suspended", reason: doctor.verification.suspensionReason, actorUserId: req.user._id });
        await doctor.save();
        await writeAuditEvent(req, "doctor-suspended", "success", { targetUserId: doctor.userId, metadata: { doctorId: doctor._id.toString(), previousStatus: previous } });
        
        res.status(200).json({
            success: true,
            data: { id: doctor._id, status: "suspended" },
            message: "Doctor profile suspended"
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
      
      const doctor = await Doctor.findById(req.params.id).select('+verification.licenseFilePublicId');
      if (!doctor) return res.status(404).json({ success: false, error: "Doctor not found." });
      Object.assign(doctor, updates);
      const clinic = await Clinic.findById(doctor.clinicId);
      if (doctor.isAvailable && !isDoctorBookable(doctor, clinic)) return res.status(409).json({ success: false, error: "Suspended, expired, or unverified clinicians cannot be made available" });
      await doctor.save();
      const updatedDoctor = await Doctor.findById(doctor._id).populate('userId', 'name email').populate('clinicId', 'name');
  
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
            const clinic = await Clinic.findById(doctor.clinicId).select("timezone");
            const { start, end } = localDayRangeUtc(date, clinic?.timezone || "Asia/Kolkata");
            query.slotStartUtc = mongoose.trusted({ $gte: start, $lt: end });
        }

        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query).setOptions({ sanitizeFilter: false })
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
