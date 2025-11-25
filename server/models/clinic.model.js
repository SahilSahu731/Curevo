import mongoose from "mongoose";

const ClinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Clinic name is required"],
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: [true, "Clinic address is required"],
    },
    phone: {
      type: String,
      required: [true, "Clinic phone is required"],
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number (E.164 format)"],
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allows null/missing values while enforcing uniqueness for non-null values
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    // --- Core Scheduling & Capacity ---
    openingTime: {
      type: String,
      required: [true, "Opening time is required (e.g., 09:00)"],
    },
    closingTime: {
      type: String,
      required: [true, "Closing time is required (e.g., 17:00)"],
    },
    averageConsultationTime: {
      type: Number, // In minutes
      required: [true, "Average consultation time is required"],
      min: [5, "Consultation time must be at least 5 minutes"],
    },
    workingDays: {
      type: [String],
      required: [true, "Working days are required"],
      enum: {
        values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        message: '{VALUE} is not a valid working day',
      },
    },
    maxPatientsPerDay: {
      type: Number,
      default: 100,
      min: [1, "Maximum patients must be at least 1"],
    },
    // --- Unique Enhancements ---
    slotBufferMinutes: {
        type: Number,
        default: 5, // Extra time added between slots for doctor buffer
        min: 0,
    },
    breakSlots: {
        type: [
            {
                startTime: { type: String, required: true }, // e.g., '13:00'
                endTime: { type: String, required: true }, // e.g., '14:00'
                reason: { type: String }
            }
        ],
        default: [],
    },
    isActive: {
      type: Boolean,
      default: true, // Controls whether the clinic is accepting appointments
    },
  },
  { timestamps: true }
);

const Clinic = mongoose.models.Clinic || mongoose.model("Clinic", ClinicSchema);
export default Clinic;