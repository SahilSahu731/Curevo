import Feedback from "../models/feedback.model.js";
import mongoose from "mongoose";
import { writeAuditEvent } from "../utils/audit.js";

export const createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      userId: req.user.id,
      category: req.body.category || "other",
      subject: req.body.subject,
      message: req.body.message,
      priority: req.body.priority || "normal",
    });

    res.status(201).json({ success: true, message: "Feedback submitted", data: feedback });
  } catch (error) {
    console.error("Create Feedback Error:", error);
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: feedback.length, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20, search = "", sortOrder = "desc" } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (category && category !== "all") query.category = category;

    if (search) {
      const escaped = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.subject = mongoose.trusted({ $regex: escaped, $options: "i" });
    }
    const [feedback, count] = await Promise.all([Feedback.find(query).setOptions({ sanitizeFilter: false })
      .populate("userId", "name email role profileImage")
      .populate("handledBy", "name email")
      .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit), Feedback.countDocuments(query).setOptions({ sanitizeFilter: false })]);

    res.status(200).json({ success: true, count, currentPage: page, totalPages: Math.max(1, Math.ceil(count / limit)), data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const updates = {
      status: req.body.status,
      priority: req.body.priority,
      adminResponse: req.body.adminResponse,
      handledBy: req.user.id,
    };

    if (["resolved", "closed"].includes(req.body.status)) {
      updates.resolvedAt = Date.now();
    }

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email role profileImage");

    if (!feedback) return res.status(404).json({ success: false, error: "Feedback not found" });
    await writeAuditEvent(req, "feedback-updated", "success", { targetUserId: feedback.userId?._id || feedback.userId, metadata: { feedbackId: feedback._id.toString(), status: feedback.status } });
    res.status(200).json({ success: true, message: "Feedback updated", data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};
