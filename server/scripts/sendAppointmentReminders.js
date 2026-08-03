import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Notification from "../models/notification.model.js";
import { deliverNotification, sendDueReminders } from "../services/notification.service.js";

try {
  await connectDB();
  const sent = await sendDueReminders();
  const retryable = await Notification.find({ deliveryStatus: { $in: ["failed", "partial"] }, attempts: { $lt: 3 }, lastAttemptAt: { $lt: new Date(Date.now() - 15 * 60_000) } }).limit(100);
  await Promise.all(retryable.map((notification) => deliverNotification(notification)));
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), notificationsProcessed: sent, deliveriesRetried: retryable.length }));
  await mongoose.disconnect();
} catch (error) {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
}
