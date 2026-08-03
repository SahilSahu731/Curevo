import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, immutable: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, index: true },
  category: { type: String, enum: ["product", "account", "privacy", "accessibility", "complaint", "other"], required: true },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ["accepted", "in-review", "resolved", "closed"], default: "accepted", index: true },
  delivery: {
    status: { type: String, enum: ["delivered", "not-configured", "failed"], required: true },
    attemptedAt: { type: Date, required: true },
  },
  ipHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

SupportTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SupportTicketSchema.index({ email: 1, createdAt: -1 });

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
