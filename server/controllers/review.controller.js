import Review from "../models/review.model.js";
import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";

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
    const patientId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(doctorId) || !Number.isInteger(Number(rating)) || rating < 1 || rating > 5 || !comment?.trim()) {
      return res.status(400).json({ message: "A valid doctor, rating from 1 to 5, and comment are required" });
    }

    const completedVisit = await Appointment.exists({ doctorId, patientId, status: "completed" });
    if (!completedVisit) {
      return res.status(403).json({ message: "Only patients with a completed visit can review this clinician" });
    }

    const existingReview = await Review.findOne({ doctorId, patientId });
    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this clinician" });
    }

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
