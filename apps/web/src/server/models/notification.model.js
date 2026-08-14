import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // The user who should receive the notification
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false, // Optional, links notification to a specific appointment
    },
    type: {
      type: String,
      enum: ['booking-confirmation', 'appointment-reminder', 'telehealth-ready', 'check-in-open', 'turn-approaching', 'turn-now', 'appointment-completed', 'follow-up', 'appointment-cancelled', 'appointment-rescheduled', 'system-alert'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    templateKey: { type: String, trim: true },
    locale: { type: String, default: "en-IN" },
    safeLink: { type: String, trim: true },
    dedupKey: { type: String, trim: true },
    channels: { type: [String], enum: ["in-app", "email", "sms"], default: ["in-app"] },
    deliveryStatus: { type: String, enum: ["pending", "sent", "partial", "failed"], default: "pending", index: true },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: Date,
    deliveredAt: Date,
    failureCode: { type: String, trim: true },
  },
  { timestamps: true }
);
NotificationSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

// Index for quick fetching of unread notifications for a user
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index(
  { userId: 1, dedupKey: 1 },
  { unique: true, partialFilterExpression: { dedupKey: { $type: "string" } } },
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;
