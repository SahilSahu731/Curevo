import mongoose from "mongoose";

const AccountTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: {
    type: String,
    enum: ["password-reset", "email-verify", "email-change-old", "email-change-new", "mfa-login"],
    required: true,
    index: true,
  },
  tokenHash: { type: String, required: true, unique: true, select: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  consumedAt: Date,
  attempts: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

AccountTokenSchema.index({ userId: 1, type: 1, consumedAt: 1 });

export default mongoose.models.AccountToken || mongoose.model("AccountToken", AccountTokenSchema);
