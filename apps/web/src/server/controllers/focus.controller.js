import mongoose from "mongoose";

import FocusSession from "../models/focusSession.model.js";
import Reflection from "../models/reflection.model.js";
import Routine from "../models/routine.model.js";

const owned = (userId, id) => ({ _id: id, userId });

export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [summary, daily, routines, recentSessions, latestReflection, reflectionCount] = await Promise.all([
      FocusSession.aggregate([
        { $match: { userId, status: "completed", startedAt: { $gte: weekStart } } },
        { $group: {
          _id: null,
          weekMinutes: { $sum: "$durationMinutes" },
          completedSessions: { $sum: 1 },
          todayMinutes: { $sum: { $cond: [{ $gte: ["$startedAt", today] }, "$durationMinutes", 0] } },
        } },
      ]),
      FocusSession.aggregate([
        { $match: { userId, status: "completed", startedAt: { $gte: weekStart } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } }, minutes: { $sum: "$durationMinutes" }, sessions: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Routine.find({ userId: req.user._id, active: true }).sort({ preferredTime: 1, createdAt: 1 }).limit(8).lean(),
      FocusSession.find({ userId: req.user._id }).sort({ startedAt: -1 }).limit(5).lean(),
      Reflection.findOne({ userId: req.user._id }).sort({ createdAt: -1 }).lean(),
      Reflection.countDocuments({ userId: req.user._id, createdAt: { $gte: weekStart } }),
    ]);

    res.json({
      success: true,
      data: {
        summary: { todayMinutes: 0, weekMinutes: 0, completedSessions: 0, activeRoutines: routines.length, reflectionsThisWeek: reflectionCount, ...(summary[0] || {}) },
        daily,
        routines,
        recentSessions,
        latestReflection,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Could not load your focus overview" });
  }
};

export const listSessions = async (req, res) => {
  const { page, limit } = req.query;
  const query = { userId: req.user._id };
  const [data, count] = await Promise.all([
    FocusSession.find(query).sort({ startedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    FocusSession.countDocuments(query),
  ]);
  res.json({ success: true, count, page, totalPages: Math.max(1, Math.ceil(count / limit)), data });
};

export const createSession = async (req, res) => {
  const completedAt = req.body.status === "completed" ? (req.body.completedAt || new Date()) : req.body.completedAt;
  const session = await FocusSession.create({ ...req.body, userId: req.user._id, completedAt });
  res.status(201).json({ success: true, data: session });
};

export const updateSession = async (req, res) => {
  const updates = { ...req.body };
  if (updates.status === "completed" && updates.completedAt === undefined) updates.completedAt = new Date();
  const session = await FocusSession.findOneAndUpdate(owned(req.user._id, req.params.id), updates, { new: true, runValidators: true });
  if (!session) return res.status(404).json({ success: false, error: "Focus session not found" });
  res.json({ success: true, data: session });
};

export const deleteSession = async (req, res) => {
  const session = await FocusSession.findOneAndDelete(owned(req.user._id, req.params.id));
  if (!session) return res.status(404).json({ success: false, error: "Focus session not found" });
  res.json({ success: true, data: {} });
};

export const listRoutines = async (req, res) => {
  const data = await Routine.find({ userId: req.user._id }).sort({ active: -1, preferredTime: 1, createdAt: -1 }).lean();
  res.json({ success: true, count: data.length, data });
};

export const createRoutine = async (req, res) => {
  const routine = await Routine.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: routine });
};

export const updateRoutine = async (req, res) => {
  const routine = await Routine.findOneAndUpdate(owned(req.user._id, req.params.id), req.body, { new: true, runValidators: true });
  if (!routine) return res.status(404).json({ success: false, error: "Routine not found" });
  res.json({ success: true, data: routine });
};

export const deleteRoutine = async (req, res) => {
  const routine = await Routine.findOneAndDelete(owned(req.user._id, req.params.id));
  if (!routine) return res.status(404).json({ success: false, error: "Routine not found" });
  res.json({ success: true, data: {} });
};

export const completeRoutine = async (req, res) => {
  const routine = await Routine.findOne(owned(req.user._id, req.params.id));
  if (!routine || !routine.active) return res.status(404).json({ success: false, error: "Active routine not found" });
  const now = new Date();
  const session = await FocusSession.create({
    userId: req.user._id,
    routineId: routine._id,
    intention: routine.title,
    durationMinutes: routine.durationMinutes,
    status: "completed",
    startedAt: new Date(now.getTime() - routine.durationMinutes * 60_000),
    completedAt: now,
    distractionCount: req.body.distractionCount,
    closingNote: req.body.closingNote,
  });
  routine.completionCount += 1;
  routine.lastCompletedAt = now;
  await routine.save();
  res.status(201).json({ success: true, data: { routine, session } });
};

export const listReflections = async (req, res) => {
  const { page, limit } = req.query;
  const query = { userId: req.user._id };
  const [data, count] = await Promise.all([
    Reflection.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Reflection.countDocuments(query),
  ]);
  res.json({ success: true, count, page, totalPages: Math.max(1, Math.ceil(count / limit)), data });
};

export const createReflection = async (req, res) => {
  const reflection = await Reflection.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: reflection });
};

export const deleteReflection = async (req, res) => {
  const reflection = await Reflection.findOneAndDelete(owned(req.user._id, req.params.id));
  if (!reflection) return res.status(404).json({ success: false, error: "Reflection not found" });
  res.json({ success: true, data: {} });
};
