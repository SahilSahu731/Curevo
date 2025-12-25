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
    }
  },
  { timestamps: true }
);

// Prevent multiple reviews from the same patient for the same clinic if desired
// ClinicReviewSchema.index({ clinicId: 1, patientId: 1 }, { unique: true });

const ClinicReview = mongoose.models.ClinicReview || mongoose.model("ClinicReview", ClinicReviewSchema);
export default ClinicReview;
