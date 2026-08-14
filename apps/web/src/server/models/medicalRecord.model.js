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
    storageKey: { type: String, trim: true },
    resourceType: { type: String, trim: true },
    format: { type: String, trim: true },
    url: { type: String, trim: true, select: false },
    type: { type: String, trim: true },
    size: { type: Number, min: 0, max: 10 * 1024 * 1024 },
    status: { type: String, enum: ["quarantined", "available", "deleted"], default: "quarantined" },
  }
);

const AddendumSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 20000 },
  authorDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

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
    patientInstructions: {
      type: String,
      trim: true,
    },
    // Legacy field retained only for migration; never included in public projections.
    doctorNotes: { type: String, trim: true, select: false },
    followUpDate: {
      type: Date,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    addenda: { type: [AddendumSchema], default: [] },
    authorDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", index: true },
    finalizedAt: Date,
    revision: { type: Number, min: 1, default: 1 },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
MedicalRecordSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

MedicalRecordSchema.index({ patientId: 1, createdAt: -1 });
MedicalRecordSchema.index({ doctorId: 1, createdAt: -1 });

const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", MedicalRecordSchema);
export default MedicalRecord;
