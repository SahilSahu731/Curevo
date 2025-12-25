import ClinicReview from "../models/clinicReview.model.js";

export const getClinicReviews = async (req, res) => {
  try {
    const reviews = await ClinicReview.find({ clinicId: req.params.clinicId })
      .populate({
        path: "patientId",
        select: "name profileImage", 
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const createClinicReview = async (req, res) => {
  try {
    const { clinicId, rating, comment } = req.body;
    const patientId = req.user._id;

    const review = await ClinicReview.create({
      clinicId,
      patientId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
