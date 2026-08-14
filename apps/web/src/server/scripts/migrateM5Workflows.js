import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import SupportTicket from "../models/supportTicket.model.js";
import User from "../models/user.model.js";

try {
  await connectDB();
  const admins = await User.find({ role: "admin" }).sort({ createdAt: 1 }).select("_id email adminScope");
  let operations = 0;
  for (const admin of admins) {
    const nextScope = admin.adminScope || "operations";
    if (admin.adminScope !== nextScope) {
      admin.adminScope = nextScope;
      await admin.save();
      operations += 1;
    }
  }
  await Promise.all([User.createIndexes(), SupportTicket.createIndexes()]);
  console.log(JSON.stringify({ admins: admins.length, updated: operations, superAdminChanges: 0 }));
  await mongoose.disconnect();
} catch (error) {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
}
