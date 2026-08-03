import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: Date,
  revokedReason: { type: String, maxlength: 80 },
  lastSeenAt: { type: Date, default: Date.now },
  ipHash: { type: String, select: false },
  userAgent: { type: String, maxlength: 300 },
  remember: { type: Boolean, default: false },
  mfaVerifiedAt: Date,
  mfaEnrollmentRequired: { type: Boolean, default: false },
}, { timestamps: true });

SessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
