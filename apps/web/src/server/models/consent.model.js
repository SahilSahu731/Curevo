import mongoose from "mongoose";

const ConsentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["terms-and-privacy"],
      required: true,
      index: true,
    },
    policyVersion: { type: String, required: true },
    accepted: { type: Boolean, required: true },
    source: {
      type: String,
      enum: ["email-registration", "google-oauth", "settings"],
      required: true,
    },
    acceptedAt: Date,
    revokedAt: Date,
  },
  { timestamps: true }
);
ConsentSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

ConsentSchema.index({ userId: 1, type: 1, createdAt: -1 });

const Consent = mongoose.models.Consent || mongoose.model("Consent", ConsentSchema);
export default Consent;
