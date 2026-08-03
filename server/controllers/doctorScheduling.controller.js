import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import { listAvailableSlots } from "../utils/scheduling.js";

export const getAvailableSlots = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid Doctor ID format" });
    }
    if (!req.query.date) return res.status(400).json({ success: false, error: "date is required in YYYY-MM-DD format" });
    const doctor = await Doctor.findById(req.params.id)
      .select("+verification.licenseFilePublicId")
      .populate("clinicId");
    if (!doctor?.clinicId) return res.status(404).json({ success: false, error: "Doctor or clinic not found" });
    const data = await listAvailableSlots({
      doctor,
      clinic: doctor.clinicId,
      localDate: req.query.date,
      consultationType: req.query.consultationType || "in-person",
    });
    return res.status(200).json({ success: true, count: data.length, timezone: doctor.clinicId.timezone, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, error: error.statusCode ? error.message : "Could not process slot request" });
  }
};
