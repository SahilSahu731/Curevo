import Review from "../models/review.model.js";

// Get reviews for a specific doctor
export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctorId })
      .populate("patientId", "name profileImage") // Fetch name and profile image
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;
    const patientId = req.user._id; // Assuming auth middleware sets req.user

    // Prevent duplicate reviews if needed? For now, allow multiple.
    
    const newReview = new Review({
      doctorId,
      patientId,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    
    // Populate patient details for immediate return
    await savedReview.populate("patientId", "name profileImage");

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};
