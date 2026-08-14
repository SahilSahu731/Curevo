import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    routineId: { type: mongoose.Schema.Types.ObjectId, ref: "Routine" },
    type: { type: String, enum: ["routine-reminder", "focus-nudge", "reflection-prompt", "system-alert"], required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    isRead: { type: Boolean, default: false },
    templateKey: { type: String, trim: true },
    locale: { type: String, default: "en-IN" },
    safeLink: { type: String, trim: true },
    dedupKey: { type: String, trim: true },
    channels: { type: [String], enum: ["in-app", "email"], default: ["in-app"] },
    deliveryStatus: { type: String, enum: ["pending", "sent", "partial", "failed"], default: "pending", index: true },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: Date,
    deliveredAt: Date,
    failureCode: { type: String, trim: true },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, dedupKey: 1 }, { unique: true, partialFilterExpression: { dedupKey: { $type: "string" } } });

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;
