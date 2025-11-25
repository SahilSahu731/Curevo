import mongoose from "mongoose";

const QueueSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date, // Date of the queue (should be reset daily)
      required: true,
    },
    currentToken: {
      type: Number,
      default: 0, // The token number currently being served
    },
    appointmentIds: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      }],
      default: [], // The main queue (ordered list of Appointment IDs)
    },
    emergencyQueue: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      }],
      default: [], // List of high-priority Appointment IDs
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure only ONE queue exists per Doctor/Clinic per Day
QueueSchema.index({ doctorId: 1, clinicId: 1, date: 1 }, { unique: true });

const Queue = mongoose.models.Queue || mongoose.model("Queue", QueueSchema);
export default Queue;