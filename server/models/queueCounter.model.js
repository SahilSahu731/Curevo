import mongoose from "mongoose";

const QueueCounterSchema = new mongoose.Schema({
  isSynthetic: { type: Boolean, default: false, index: true },
  seedBatch: { type: String, index: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  localDate: { type: String, required: true },
  timezone: { type: String, required: true },
  sequence: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

QueueCounterSchema.index({ clinicId: 1, doctorId: 1, localDate: 1 }, { unique: true });

export default mongoose.models.QueueCounter || mongoose.model("QueueCounter", QueueCounterSchema);
