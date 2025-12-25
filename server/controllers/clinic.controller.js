import mongoose from "mongoose";
import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";

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

    const clinic = await Clinic.create({
        name, 
        address, 
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
    });

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
    const clinics = await Clinic.find().sort({ name: 1 });
    
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

    const clinic = await Clinic.findById(req.params.id);

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
    
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators (like unique, enum, regex)
    });

    if (!clinic) {
      return res.status(404).json({ success: false, error: "Clinic not found" });
    }

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

    const doctors = await Doctor.find({ clinicId: req.params.id })
      .populate({
        path: 'userId',
        select: 'name email profileImage', 
      })
      .select('-clinicId -currentPatient'); 

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

        const clinic = await Clinic.findByIdAndDelete(req.params.id);

        if (!clinic) {
            return res.status(404).json({ success: false, error: "Clinic not found" });
        }

        res.status(200).json({
            success: true,
            data: {},
            message: "Clinic deleted successfully"
        });
    } catch (error) {
        handleMongooseError(res, error);
    }
};