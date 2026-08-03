import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming reviews are by Users directly, or Patients if there's a Patient model. 
                   // Based on previous context, users book appointments, so likely User.
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required() { return !this.isSynthetic; },
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isHelpful: {
        type: Number,
        default: 0
    },
    status: { type: String, enum: ["pending", "published", "reported", "hidden", "withdrawn"], default: "published", index: true },
    editedAt: Date,
    report: { reason: String, reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reportedAt: Date },
    moderation: { reason: String, moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, moderatedAt: Date, appeal: String },
    providerResponse: { text: String, responderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, respondedAt: Date },
  },
  { timestamps: true }
);
ReviewSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });
ReviewSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;
