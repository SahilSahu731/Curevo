import mongoose from "mongoose";

const ClinicalNoteRevisionSchema = new mongoose.Schema({
  notes: { type: String, required: true, maxlength: 20000 },
  authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const ClinicalNoteSchema = new mongoose.Schema({
  medicalRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord", required: true, unique: true, index: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  notes: { type: String, required: true, maxlength: 20000 },
  authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  revisions: { type: [ClinicalNoteRevisionSchema], default: [] },
  finalizedAt: Date,
}, { timestamps: true });

export default mongoose.models.ClinicalNote || mongoose.model("ClinicalNote", ClinicalNoteSchema);
