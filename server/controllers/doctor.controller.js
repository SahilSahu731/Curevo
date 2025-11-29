import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";


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

    // 1. Validation Checks
    if (!userId || !clinicId) {
      return res.status(400).json({ success: false, error: "userId and clinicId are required." });
    }

    // 2. Verify User Role (Must be 'doctor' or 'admin' establishing a new doctor)
    const user = await User.findById(userId);
    if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
      return res.status(400).json({ success: false, error: "User not found or does not have a valid role for a doctor profile." });
    }

    // 3. Verify Clinic Existence
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, error: "Clinic not found." });
    }

    // 4. Create Doctor Profile
    const doctor = await Doctor.create({
      userId,
      clinicId,
      specialization,
      qualification,
      experience,
      consultationFee,
      isAvailable: true // Default to available upon creation
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
    // Fetch all doctors and populate the related user data
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

    // Optionally update User profile name/phone/image if provided
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

    // Toggle the boolean state
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

// --- Slot Generation Logic ---

// Helper to convert time string (HH:MM) to minutes past midnight
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Helper to convert minutes past midnight back to time string (HH:MM)
const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const { date } = req.query; // date should be YYYY-MM-DD

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ success: false, error: "Invalid Doctor ID format." });
    }
    if (!date) {
        return res.status(400).json({ success: false, error: "Date query parameter is required (YYYY-MM-DD)." });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

    // 1. Fetch Doctor and Clinic details
    const doctor = await Doctor.findById(doctorId).populate('clinicId');

    if (!doctor) {
        return res.status(404).json({ success: false, error: "Doctor not found." });
    }
    const clinic = doctor.clinicId;

    if (!clinic || !clinic.isActive) {
        return res.status(404).json({ success: false, error: "Clinic is inactive or not found." });
    }

    // 2. Check if doctor/clinic is working on that day
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

    // Convert times to minutes past midnight
    let currentTimeMinutes = timeToMinutes(openingTime);
    const closingTimeMinutes = timeToMinutes(closingTime);
    
    const slotDuration = averageConsultationTime + (slotBufferMinutes || 0);
    const availableSlots = [];

    // 3. Generate slots
    while (currentTimeMinutes < closingTimeMinutes) {
        const slotEndTimeMinutes = currentTimeMinutes + averageConsultationTime;
        const totalSlotEndTimeMinutes = currentTimeMinutes + slotDuration;

        // Check if current slot overlaps with any break
        const isBreak = breakSlots.some(breakTime => {
            const breakStart = timeToMinutes(breakTime.startTime);
            const breakEnd = timeToMinutes(breakTime.endTime);
            // Check if slot starts before break ends AND slot ends after break starts
            return currentTimeMinutes < breakEnd && totalSlotEndTimeMinutes > breakStart;
        });

        if (isBreak) {
            // Find the next available time after the break ends
            const nextTime = Math.max(...breakSlots.map(b => timeToMinutes(b.endTime)));
            currentTimeMinutes = nextTime;
            continue; 
        }

        // Check if the slot ends after closing time
        if (slotEndTimeMinutes > closingTimeMinutes) {
            break;
        }

        // Slot is valid and available
        availableSlots.push({
            time: minutesToTime(currentTimeMinutes),
            duration: averageConsultationTime,
            isBooked: false, // This will be updated later based on existing appointments
        });

        // Move to the next slot
        currentTimeMinutes = totalSlotEndTimeMinutes;
    }

    // 4. (TODO: Filter out already booked slots)
    // You would query the Appointment model for this doctor/date here and set isBooked: true

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