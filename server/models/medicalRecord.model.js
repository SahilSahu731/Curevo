import mongoose from "mongoose";

const PrescriptionItemSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
    instructions: { type: String, trim: true },
  },
  { _id: false }
);

const AttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
  },
  { _id: false }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    prescription: {
      type: [PrescriptionItemSchema],
      default: [],
    },
    treatmentPlan: {
      type: String,
      trim: true,
    },
    doctorNotes: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);
MedicalRecordSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

MedicalRecordSchema.index({ patientId: 1, createdAt: -1 });
MedicalRecordSchema.index({ doctorId: 1, createdAt: -1 });

const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", MedicalRecordSchema);
export default MedicalRecord;
