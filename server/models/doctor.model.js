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
    verification: {
      status: {
        type: String,
        enum: ['not-submitted', 'pending', 'approved', 'rejected'],
        default: 'not-submitted',
        index: true,
      },
      licenseNumber: {
        type: String,
        trim: true,
      },
      licenseFileUrl: {
        type: String,
        trim: true,
      },
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: {
        type: String,
        trim: true,
      },
    },
    availability: {
      days: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: undefined,
      },
      startTime: {
        type: String,
        default: undefined,
      },
      endTime: {
        type: String,
        default: undefined,
      },
      slotDuration: {
        type: Number,
        min: 5,
        default: undefined,
      },
    },
    blockedSlots: {
      type: [
        {
          date: { type: Date, required: true },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
          reason: { type: String, trim: true },
        }
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index for quick lookups and ensuring unique clinic-doctor associations
DoctorSchema.index({ userId: 1, clinicId: 1 }, { unique: true });

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
export default Doctor;
