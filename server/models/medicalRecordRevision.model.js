import mongoose from "mongoose";

const MedicalRecordRevisionSchema = new mongoose.Schema({
  medicalRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord", required: true, index: true },
  revision: { type: Number, required: true },
  kind: { type: String, enum: ["snapshot", "addendum"], required: true },
  authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fields: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

MedicalRecordRevisionSchema.index({ medicalRecordId: 1, revision: -1 });
export default mongoose.models.MedicalRecordRevision || mongoose.model("MedicalRecordRevision", MedicalRecordRevisionSchema);
