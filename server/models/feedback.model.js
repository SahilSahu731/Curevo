import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["complaint", "bug", "billing", "feature", "clinical", "other"],
      default: "other",
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ["open", "in-review", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    adminResponse: {
      type: String,
      trim: true,
    },
    resolvedAt: Date,
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
FeedbackSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

FeedbackSchema.index({ status: 1, createdAt: -1 });

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
