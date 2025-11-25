import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // A User can only be associated with one Doctor profile
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    specialization: {
      type: String,
      required: [true, "Doctor specialization is required"],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },
    experience: {
      type: Number, // In years
      required: [true, "Experience is required"],
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null, // Tracks the appointment ID of the patient currently being consulted
    },
  },
  { timestamps: true }
);

// Compound index for quick lookups and ensuring unique clinic-doctor associations
DoctorSchema.index({ userId: 1, clinicId: 1 }, { unique: true });

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
export default Doctor;