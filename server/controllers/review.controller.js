import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Review from "../models/review.model.js";
import { writeAuditEvent } from "../utils/audit.js";

const validText = (value, min = 10, max = 1000) => typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
const fail = (res, status, message) => res.status(status).json({ success: false, error: message });

export const getDoctorReviews = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.doctorId)) return fail(res, 400, "Invalid doctor ID");
  const reviews = await Review.find({ doctorId: req.params.doctorId, status: "published" })
    .select("doctorId patientId rating comment isHelpful providerResponse editedAt createdAt isSynthetic")
    .populate("patientId", "name profileImage").sort({ createdAt: -1 }).lean();
  const aggregate = await Review.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(req.params.doctorId), status: "published" } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  return res.json({ success: true, data: reviews, ratingStats: { averageRating: aggregate[0] ? Number(aggregate[0].average.toFixed(1)) : 0, reviewCount: aggregate[0]?.count || 0 } });
};

export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(appointmentId) || !Number.isInteger(Number(rating)) || rating < 1 || rating > 5 || !validText(comment)) return fail(res, 400, "Completed appointment, rating from 1 to 5, and a 10-1000 character comment are required");
    const appointment = await Appointment.findOne({ _id: appointmentId, patientId: req.user._id, status: "completed" });
    if (!appointment) return fail(res, 403, "Only the patient from a completed appointment can review it");
    const review = await Review.create({ appointmentId, doctorId: appointment.doctorId, patientId: req.user._id, rating: Number(rating), comment: comment.trim() });
    await writeAuditEvent(req, "doctor-review-created", "success", { metadata: { reviewId: review._id.toString(), appointmentId: appointment._id.toString() } });
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) return fail(res, 409, "This appointment already has a clinician review");
    return fail(res, 500, "Review could not be created");
  }
};

export const updateReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, patientId: req.user._id });
  if (!review) return fail(res, 404, "Review not found");
  if (Date.now() - review.createdAt.getTime() > 7 * 86_400_000) return fail(res, 409, "Review editing window has closed");
  if (req.body.rating !== undefined && (!Number.isInteger(Number(req.body.rating)) || req.body.rating < 1 || req.body.rating > 5)) return fail(res, 400, "Rating must be 1 to 5");
  if (req.body.comment !== undefined && !validText(req.body.comment)) return fail(res, 400, "Comment must be 10-1000 characters");
  if (req.body.rating !== undefined) review.rating = Number(req.body.rating);
  if (req.body.comment !== undefined) review.comment = req.body.comment.trim();
  review.editedAt = new Date(); review.status = "published";
  await review.save();
  await writeAuditEvent(req, "doctor-review-edited", "success", { metadata: { reviewId: review._id.toString() } });
  return res.json({ success: true, data: review });
};

export const withdrawReview = async (req, res) => {
  const review = await Review.findOneAndUpdate({ _id: req.params.id, patientId: req.user._id }, { status: "withdrawn" }, { new: true });
  if (!review) return fail(res, 404, "Review not found");
  await writeAuditEvent(req, "doctor-review-withdrawn", "success", { metadata: { reviewId: review._id.toString() } });
  return res.json({ success: true });
};

export const reportReview = async (req, res) => {
  if (!validText(req.body.reason, 10, 500)) return fail(res, 400, "A 10-500 character report reason is required");
  const review = await Review.findOneAndUpdate({ _id: req.params.id, status: "published" }, { status: "reported", report: { reason: req.body.reason.trim(), reportedBy: req.user._id, reportedAt: new Date() } }, { new: true });
  if (!review) return fail(res, 404, "Published review not found");
  await writeAuditEvent(req, "doctor-review-reported", "success", { metadata: { reviewId: review._id.toString() } });
  return res.json({ success: true });
};

export const respondToReview = async (req, res) => {
  if (!validText(req.body.text, 2, 1000)) return fail(res, 400, "Response must be 2-1000 characters");
  const review = await Review.findById(req.params.id);
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!review || !doctor || review.doctorId.toString() !== doctor._id.toString()) return fail(res, 403, "Not authorized to respond");
  review.providerResponse = { text: req.body.text.trim(), responderUserId: req.user._id, respondedAt: new Date() };
  await review.save();
  await writeAuditEvent(req, "doctor-review-response", "success", { metadata: { reviewId: review._id.toString() } });
  return res.json({ success: true, data: review });
};

export const moderateReview = async (req, res) => {
  if (!validText(req.body.reason, 10, 500) || !["published", "hidden"].includes(req.body.status)) return fail(res, 400, "Status and moderation reason are required");
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status, moderation: { reason: req.body.reason.trim(), moderatedBy: req.user._id, moderatedAt: new Date() } }, { new: true });
  if (!review) return fail(res, 404, "Review not found");
  await writeAuditEvent(req, "doctor-review-moderated", "success", { metadata: { reviewId: review._id.toString(), status: req.body.status } });
  return res.json({ success: true, data: review });
};

export const appealReviewModeration = async (req, res) => {
  if (!validText(req.body.reason, 10, 1000)) return fail(res, 400, "A 10-1000 character appeal reason is required");
  const review = await Review.findById(req.params.id);
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!review || !doctor || review.doctorId.toString() !== doctor._id.toString()) return fail(res, 403, "Not authorized to appeal");
  if (review.status !== "hidden") return fail(res, 409, "Only hidden reviews can be appealed");
  review.moderation.appeal = req.body.reason.trim(); await review.save();
  await writeAuditEvent(req, "doctor-review-appealed", "success", { metadata: { reviewId: review._id.toString() } });
  return res.json({ success: true });
};
