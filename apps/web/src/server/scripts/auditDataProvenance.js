import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";

const collections = ["users", "focussessions", "routines", "reflections", "feedbacks", "notifications", "consents", "privacyrequests", "auditevents"];

try {
  await connectDB();
  const report = {};
  for (const name of collections) {
    const collection = mongoose.connection.collection(name);
    const [total, synthetic, unmarked] = await Promise.all([collection.countDocuments(), collection.countDocuments({ isSynthetic: true }), collection.countDocuments({ isSynthetic: { $ne: true } })]);
    report[name] = { total, synthetic, unmarked };
  }
  console.table(report);
  console.log("Unmarked does not mean real; it means provenance is not established and requires review.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
