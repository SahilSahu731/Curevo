import Notification from "../models/notification.model.js";
import Routine from "../models/routine.model.js";
import User from "../models/user.model.js";
import { sendAccountEmail } from "../utils/mail.js";

const SUBJECTS = {
  "routine-reminder": "A gentle routine reminder",
  "focus-nudge": "Ready for one focused step?",
  "reflection-prompt": "A moment to reflect",
  "system-alert": "Curevo update",
};

export const deliverNotification = async (notification) => {
  const user = await User.findById(notification.userId).select("email notificationPreferences");
  if (!user) return notification;
  let emailDelivered = false;
  notification.attempts += 1;
  notification.lastAttemptAt = new Date();
  notification.failureCode = undefined;
  if (notification.channels.includes("email") && user.notificationPreferences?.email) {
    try {
      const result = await sendAccountEmail({ to: user.email, subject: SUBJECTS[notification.type], text: `${notification.message}\n\n${notification.safeLink || ""}`.trim() });
      emailDelivered = result.delivered;
      if (!result.delivered) notification.failureCode = result.reason;
    } catch {
      notification.failureCode = "email-provider-error";
    }
  }
  notification.deliveryStatus = emailDelivered || notification.channels.includes("in-app") ? (notification.failureCode ? "partial" : "sent") : "failed";
  if (notification.deliveryStatus === "sent") notification.deliveredAt = new Date();
  await notification.save();
  return notification;
};

export const notifyUser = async ({ userId, message, dedupKey, safeLink = "/dashboard", type = "system-alert", routineId }) => {
  const user = await User.findById(userId).select("notificationPreferences");
  if (!user || user.notificationPreferences?.inApp === false) return null;
  const base = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  const channels = ["in-app"];
  if (user.notificationPreferences?.email) channels.push("email");
  const notification = await Notification.findOneAndUpdate(
    { userId, dedupKey },
    { $setOnInsert: { routineId, type, templateKey: type, message: String(message).slice(0, 500), safeLink: `${base}${safeLink}`, channels, locale: user.notificationPreferences?.locale || "en-IN" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (notification.attempts === 0) await deliverNotification(notification);
  return notification;
};

export const sendDueReminders = async (now = new Date()) => {
  const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()];
  const dateKey = now.toISOString().slice(0, 10);
  const routines = await Routine.find({ active: true, days: day }).select("userId title preferredTime").lean();
  const results = await Promise.all(routines.map((routine) => notifyUser({
    userId: routine.userId,
    routineId: routine._id,
    type: "routine-reminder",
    dedupKey: `routine:${routine._id}:${dateKey}`,
    safeLink: "/dashboard/routines",
    message: `${routine.title} is on your plan today. Start when it fits; the reminder is an invitation, not a demand.`,
  })));
  return results.filter(Boolean).length;
};
