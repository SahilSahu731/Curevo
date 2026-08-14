import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const listNotifications = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const query = { userId: req.user._id };
  if (req.query.unread === "true") query.isRead = false;
  const [data, total, unread] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);
  return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, unread });
};

export const markNotificationRead = async (req, res) => {
  const result = req.params.id === "all"
    ? await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
    : await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { isRead: true });
  return res.json({ success: true, modified: result.modifiedCount });
};

export const getNotificationPreferences = async (req, res) => res.json({ success: true, data: req.user.notificationPreferences });

export const updateNotificationPreferences = async (req, res) => {
  const allowed = ["inApp", "email", "focusUpdates", "reminders", "locale"];
  const updates = {};
  for (const key of allowed) if (req.body[key] !== undefined) updates[`notificationPreferences.${key}`] = req.body[key];
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).select("notificationPreferences");
  return res.json({ success: true, data: user.notificationPreferences });
};
