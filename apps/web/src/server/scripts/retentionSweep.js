import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import FocusSession from "../models/focusSession.model.js";
import Reflection from "../models/reflection.model.js";

try {
  await connectDB();
  const retentionDays = Number(process.env.FOCUS_DATA_RETENTION_DAYS || 730);
  if (!Number.isFinite(retentionDays) || retentionDays < 30) throw new Error("FOCUS_DATA_RETENTION_DAYS must be at least 30");
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000);
  const [focusSessionsRequiringReview, reflectionsRequiringReview] = await Promise.all([
    FocusSession.countDocuments({ createdAt: { $lt: cutoff } }),
    Reflection.countDocuments({ createdAt: { $lt: cutoff } }),
  ]);
  console.log(JSON.stringify({ mode: "review-only", retentionDays, cutoff, focusSessionsRequiringReview, reflectionsRequiringReview }));
} finally {
  await mongoose.disconnect();
}
