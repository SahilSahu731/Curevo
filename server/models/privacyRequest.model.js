import mongoose from "mongoose";

const PrivacyRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    emailHash: { type: String, required: true, index: true },
    requestType: { type: String, enum: ["export", "deletion"], required: true },
    status: { type: String, enum: ["received", "completed", "failed"], default: "received" },
    policyVersion: { type: String, required: true },
    completedAt: Date,
  },
  { timestamps: true }
);
PrivacyRequestSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

PrivacyRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const PrivacyRequest = mongoose.models.PrivacyRequest || mongoose.model("PrivacyRequest", PrivacyRequestSchema);
export default PrivacyRequest;
