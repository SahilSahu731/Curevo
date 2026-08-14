import mongoose from "mongoose";

import Feedback from "../models/feedback.model.js";
import FocusSession from "../models/focusSession.model.js";
import Reflection from "../models/reflection.model.js";
import Routine from "../models/routine.model.js";
import User from "../models/user.model.js";
import { writeAuditEvent } from "../utils/audit.js";
import { revokeUserSessions } from "../utils/session.js";

const publicUser = (value) => {
  const user = { ...(value.toObject ? value.toObject() : value), role: value.role === "admin" ? "admin" : "member" };
  delete user.adminScope;
  return user;
};

export const getDashboardStats = async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const [members, activeRoutines, completedSessions, reflections, openFeedback, usageByDay, recentFeedback] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" }, status: "active" }),
      Routine.countDocuments({ active: true }),
      FocusSession.countDocuments({ status: "completed" }),
      Reflection.countDocuments(),
      Feedback.countDocuments({ status: { $in: ["open", "in-review"] } }),
      FocusSession.aggregate([
        { $match: { status: "completed", startedAt: { $gte: weekStart } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } }, minutes: { $sum: "$durationMinutes" }, sessions: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Feedback.find({}).populate("userId", "name email role").sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    res.json({ success: true, stats: { members, activeRoutines, completedSessions, reflections, openFeedback, usageByDay }, recentFeedback });
  } catch {
    res.status(500).json({ success: false, error: "Could not load the administration overview" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, role, status, sortBy, sortOrder } = req.query;
    const query = {};
    if (role === "admin") query.role = "admin";
    if (role === "member") query.role = mongoose.trusted({ $ne: "admin" });
    if (status !== "all") query.status = status;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = mongoose.trusted([
        { name: mongoose.trusted({ $regex: escaped, $options: "i" }) },
        { email: mongoose.trusted({ $regex: escaped, $options: "i" }) },
      ]);
    }
    const [users, count] = await Promise.all([
      User.find(query).select("-password").sort({ [sortBy]: sortOrder === "asc" ? 1 : -1, _id: 1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ]);
    res.json({ success: true, count, currentPage: page, totalPages: Math.max(1, Math.ceil(count / limit)), data: users.map(publicUser) });
  } catch {
    res.status(500).json({ success: false, error: "Could not load members" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const allowed = ["name", "phone", "role", "status"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const previous = await User.findById(req.params.id).select("name email role status");
    if (!previous) return res.status(404).json({ success: false, error: "Member not found" });
    if (previous.email !== req.body.targetEmail) return res.status(400).json({ success: false, error: "Target email does not match" });
    const changingOwnAccess = previous._id.equals(req.user._id) && ((updates.role && updates.role !== previous.role) || updates.status === "suspended");
    if (changingOwnAccess) return res.status(409).json({ success: false, error: "You cannot remove or suspend your own administrator access" });
    if (previous.role === "admin" && ((updates.role && updates.role !== "admin") || updates.status === "suspended")) {
      const activeAdmins = await User.countDocuments({ role: "admin", status: "active" });
      if (activeAdmins <= 1) return res.status(409).json({ success: false, error: "The last active administrator cannot be removed or suspended" });
    }
    const user = await User.findByIdAndUpdate(previous._id, updates, { new: true, runValidators: true }).select("-password");
    if (updates.status === "suspended") await revokeUserSessions(user._id, "admin-suspension");
    await writeAuditEvent(req, "admin-user-update", "success", { targetUserId: user._id, metadata: { fields: Object.keys(updates), reason: req.body.reason } });
    res.json({ success: true, message: "Member updated", data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Could not update member" });
  }
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: "Member not found" });
  if (user.email !== req.body.targetEmail) return res.status(400).json({ success: false, error: "Target email does not match" });
  if (user._id.equals(req.user._id)) return res.status(409).json({ success: false, error: "You cannot suspend your own account" });
  if (user.role === "admin") {
    const activeAdmins = await User.countDocuments({ role: "admin", status: "active" });
    if (activeAdmins <= 1) return res.status(409).json({ success: false, error: "The last active administrator cannot be suspended" });
  }
  user.status = "suspended";
  await user.save();
  await revokeUserSessions(user._id, "admin-deactivation");
  await writeAuditEvent(req, "account-deactivation", "success", { targetUserId: user._id, metadata: { reason: req.body.reason } });
  res.json({ success: true, message: "Member suspended" });
};
