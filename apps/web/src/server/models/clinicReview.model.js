import mongoose from "mongoose";

const ClinicReviewSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required() { return !this.isSynthetic; },
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
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
ClinicReviewSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });
ClinicReviewSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });

// Prevent multiple reviews from the same patient for the same clinic if desired
// ClinicReviewSchema.index({ clinicId: 1, patientId: 1 }, { unique: true });

const ClinicReview = mongoose.models.ClinicReview || mongoose.model("ClinicReview", ClinicReviewSchema);
export default ClinicReview;
