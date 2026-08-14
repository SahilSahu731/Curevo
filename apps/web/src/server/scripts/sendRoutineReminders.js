import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import Notification from "../models/notification.model.js";
import { deliverNotification, sendDueReminders } from "../services/notification.service.js";

try {
  await connectDB();
  const sent = await sendDueReminders();
  const retryable = await Notification.find({ deliveryStatus: { $in: ["failed", "partial"] }, attempts: { $lt: 3 }, lastAttemptAt: { $lt: new Date(Date.now() - 15 * 60_000) } }).limit(100);
  await Promise.all(retryable.map(deliverNotification));
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), remindersProcessed: sent, deliveriesRetried: retryable.length }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
