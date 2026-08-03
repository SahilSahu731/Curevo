import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Doctor from "../models/doctor.model.js";
import Notification from "../models/notification.model.js";

try {
  await connectDB();
  const now = new Date();
  const reminderEnd = new Date(now.getTime() + 30 * 86_400_000);
  const expiring = await Doctor.find({ "verification.status": "approved", "verification.expiresAt": { $gt: now, $lte: reminderEnd } }).select("userId verification.expiresAt");
  for (const doctor of expiring) {
    await Notification.updateOne(
      { userId: doctor.userId, dedupKey: `license-expiry:${doctor._id}:${doctor.verification.expiresAt.toISOString().slice(0, 10)}` },
      { $setOnInsert: { type: "system-alert", templateKey: "license-expiry", message: "Your credential verification is nearing expiry. Submit renewed documentation from your profile.", channels: ["in-app"], deliveryStatus: "sent", attempts: 1 } },
      { upsert: true },
    );
  }
  const expired = await Doctor.updateMany(
    { "verification.status": "approved", "verification.expiresAt": { $lte: now } },
    { $set: { "verification.status": "expired", isAvailable: false }, $push: { "verification.history": { from: "approved", to: "expired", reason: "Credential expiry reached", changedAt: now } } },
  );
  console.log(JSON.stringify({ reminders: expiring.length, expired: expired.modifiedCount }));
  await mongoose.disconnect();
} catch (error) {
  console.error(error.message); process.exitCode = 1; await mongoose.disconnect().catch(() => {});
}
