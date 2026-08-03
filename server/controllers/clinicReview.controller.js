import ClinicReview from "../models/clinicReview.model.js";
import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";

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

    if (!mongoose.Types.ObjectId.isValid(clinicId) || !Number.isInteger(Number(rating)) || rating < 1 || rating > 5 || !comment?.trim()) {
      return res.status(400).json({ success: false, error: "A valid clinic, rating from 1 to 5, and comment are required" });
    }

    const completedVisit = await Appointment.exists({ clinicId, patientId, status: "completed" });
    if (!completedVisit) {
      return res.status(403).json({ success: false, error: "Only patients with a completed visit can review this clinic" });
    }
    if (await ClinicReview.exists({ clinicId, patientId })) {
      return res.status(409).json({ success: false, error: "You have already reviewed this clinic" });
    }

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
