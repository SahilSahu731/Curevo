import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slotTime: {
      type: String, // e.g., '09:00 AM'
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
      unique: true, // Ensures a unique token number for the day/system
    },
    status: {
      type: String,
      enum: ['booked', 'waiting', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'booked',
    },
    priority: {
      type: String,
      enum: ['normal', 'emergency'],
      default: 'normal',
    },
    symptoms: {
      type: String,
      trim: true,
    },
    estimatedWaitTime: {
      type: Number, // In minutes, calculated by the system
    },
    actualWaitTime: {
      type: Number, // In minutes
    },
    checkInTime: {
      type: Date,
    },
    consultationStartTime: {
      type: Date,
    },
    consultationEndTime: {
      type: Date,
    },
    notes: {
      type: String, // Doctor's notes after consultation
    },
  },
  { timestamps: true }
);

// Compound index for quick fetching of today's appointments for a doctor/clinic
AppointmentSchema.index({ doctorId: 1, date: 1 });
AppointmentSchema.index({ patientId: 1, date: -1 }); // Patient history sort by newest

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
export default Appointment;