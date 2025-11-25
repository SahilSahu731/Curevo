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
      enum: ['booking-confirmation', 'turn-approaching', 'turn-now', 'appointment-cancelled', 'system-alert'],
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
  },
  { timestamps: true }
);

// Index for quick fetching of unread notifications for a user
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;