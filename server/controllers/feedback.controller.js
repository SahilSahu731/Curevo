import Feedback from "../models/feedback.model.js";

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
    const { status, category } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (category && category !== "all") query.category = category;

    const feedback = await Feedback.find(query)
      .populate("userId", "name email role profileImage")
      .populate("handledBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedback.length, data: feedback });
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
    res.status(200).json({ success: true, message: "Feedback updated", data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};
