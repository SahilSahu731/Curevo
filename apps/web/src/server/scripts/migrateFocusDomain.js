import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import User from "../models/user.model.js";

try {
  await connectDB();
  const roles = await User.collection.updateMany({ role: { $ne: "admin" } }, { $set: { role: "member" }, $unset: { adminScope: "", "notificationPreferences.appointmentUpdates": "", "notificationPreferences.sms": "" } });
  const admins = await User.collection.updateMany({ role: "admin" }, { $unset: { adminScope: "" } });
  const preferences = await User.collection.updateMany({ "notificationPreferences.focusUpdates": { $exists: false } }, { $set: { "notificationPreferences.focusUpdates": true } });
  console.log(JSON.stringify({ membersNormalized: roles.modifiedCount, adminsNormalized: admins.modifiedCount, preferencesNormalized: preferences.modifiedCount }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
