import mongoose from "mongoose";

const SlotReservationSchema = new mongoose.Schema({
  isSynthetic: { type: Boolean, default: false, index: true },
  seedBatch: { type: String, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slotStartUtc: { type: Date, required: true },
  slotEndUtc: { type: Date, required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  state: { type: String, enum: ["held", "booked", "released"], default: "held" },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

SlotReservationSchema.index(
  { doctorId: 1, clinicId: 1, slotStartUtc: 1 },
  { unique: true, partialFilterExpression: { state: { $in: ["held", "booked"] } } },
);
SlotReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.SlotReservation || mongoose.model("SlotReservation", SlotReservationSchema);
