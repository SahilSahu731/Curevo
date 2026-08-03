import mongoose from "mongoose";
import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";
import { isValidTimezone, normalizeTime } from "../utils/scheduling.js";
import { writeAuditEvent } from "../utils/audit.js";

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


export const createClinic = async (req, res) => {
  try {
    const { 
        name, 
        address, 
        city,
        state,
        zipCode,
        description,
        images,
        services,
        phone, 
        email, 
        openingTime, 
        closingTime, 
        averageConsultationTime, 
        workingDays,
        maxPatientsPerDay,
        slotBufferMinutes,
        breakSlots,
        isActive
    } = req.body;
    const timezone = req.body.timezone || "Asia/Kolkata";
    if (!isValidTimezone(timezone)) return res.status(400).json({ success: false, error: "A valid IANA timezone is required" });
    const normalizedOpening = normalizeTime(openingTime);
    const normalizedClosing = normalizeTime(closingTime);
    if (normalizedOpening >= normalizedClosing) return res.status(400).json({ success: false, error: "Closing time must be after opening time" });

    const clinic = await Clinic.create({
        name, 
        address,
        city,
        state,
        zipCode,
        description,
        images,
        services, 
        phone, 
        email, 
        timezone,
        openingTime: normalizedOpening,
        closingTime: normalizedClosing,
        averageConsultationTime, 
        workingDays,
        maxPatientsPerDay,
        slotBufferMinutes,
        breakSlots,
        isActive,
        bookingHorizonDays: req.body.bookingHorizonDays,
        cancellationNoticeHours: req.body.cancellationNoticeHours,
        supportedConsultationTypes: req.body.supportedConsultationTypes,
        checkInOpensMinutesBefore: req.body.checkInOpensMinutesBefore,
        checkInClosesMinutesAfter: req.body.checkInClosesMinutesAfter,
    });
    await writeAuditEvent(req, 'clinic-created', 'success', { metadata: { clinicId: clinic._id.toString() } });

    res.status(201).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    handleMongooseError(res, error);
  }
};

export const getClinics = async (req, res) => {
  try {
    // Optionally add pagination/filtering logic here
    const clinics = await Clinic.find({ isActive: true })
      .select('name address city state zipCode description images services phone email timezone openingTime closingTime workingDays averageConsultationTime maxPatientsPerDay slotBufferMinutes breakSlots isActive supportedConsultationTypes bookingHorizonDays')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: clinics.length,
      data: clinics,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getClinic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, error: "Invalid Clinic ID format." });
    }

    const clinic = await Clinic.findOne({ _id: req.params.id, isActive: true })
      .select('name address city state zipCode description images services phone email timezone openingTime closingTime workingDays averageConsultationTime maxPatientsPerDay slotBufferMinutes breakSlots isActive supportedConsultationTypes bookingHorizonDays cancellationNoticeHours');

    if (!clinic) {
      return res.status(404).json({ success: false, error: "Clinic not found" });
    }

    res.status(200).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const updateClinic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, error: "Invalid Clinic ID format." });
    }
    
    const allowed = ['name', 'address', 'city', 'state', 'zipCode', 'description', 'images', 'services', 'phone', 'email', 'timezone', 'openingTime', 'closingTime', 'averageConsultationTime', 'workingDays', 'maxPatientsPerDay', 'slotBufferMinutes', 'breakSlots', 'isActive', 'bookingHorizonDays', 'cancellationNoticeHours', 'supportedConsultationTypes', 'checkInOpensMinutesBefore', 'checkInClosesMinutesAfter'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (updates.timezone && !isValidTimezone(updates.timezone)) return res.status(400).json({ success: false, error: "A valid IANA timezone is required" });
    if (updates.openingTime) updates.openingTime = normalizeTime(updates.openingTime);
    if (updates.closingTime) updates.closingTime = normalizeTime(updates.closingTime);
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators (like unique, enum, regex)
    });

    if (!clinic) {
      return res.status(404).json({ success: false, error: "Clinic not found" });
    }
    await writeAuditEvent(req, 'clinic-updated', 'success', { metadata: { clinicId: clinic._id.toString(), fields: Object.keys(updates) } });

    res.status(200).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    handleMongooseError(res, error);
  }
};

export const getClinicDoctors = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, error: "Invalid Clinic ID format." });
    }

    const clinic = await Clinic.exists({ _id: req.params.id, isActive: true });
    if (!clinic) return res.status(404).json({ success: false, error: "Active clinic not found" });
    let doctors = await Doctor.find({
      clinicId: req.params.id,
      isAvailable: true,
      "verification.status": "approved",
      $and: [
        { $or: [{ "verification.expiresAt": mongoose.trusted({ $exists: false }) }, { "verification.expiresAt": null }, { "verification.expiresAt": mongoose.trusted({ $gt: new Date() }) }] },
        { $or: [{ "verification.licenseFilePublicId": mongoose.trusted({ $exists: true }) }, { "verification.licenseFileUrl": mongoose.trusted({ $exists: true }) }] },
      ],
    }).setOptions({ sanitizeFilter: false })
      .populate({
        path: 'userId',
        select: 'name email profileImage status',
        match: { status: 'active' },
      })
      .select('userId specialization qualification experience consultationFee isAvailable availability createdAt updatedAt isSynthetic');
    doctors = doctors.filter((doctor) => doctor.userId);

    if (doctors.length === 0) {
        // Return 200 with an empty array if the clinic exists but has no doctors
        return res.status(200).json({ 
            success: true, 
            count: 0,
            data: [], 
            message: "Clinic found, but no doctors are currently registered." 
        });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const deleteClinic = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: "Invalid Clinic ID format." });
        }

        const clinic = await Clinic.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!clinic) {
            return res.status(404).json({ success: false, error: "Clinic not found" });
        }
        await writeAuditEvent(req, 'clinic-deactivated', 'success', { metadata: { clinicId: clinic._id.toString() } });

        res.status(200).json({
            success: true,
            data: { id: clinic._id, isActive: false },
            message: "Clinic deactivated"
        });
    } catch (error) {
        handleMongooseError(res, error);
    }
};
