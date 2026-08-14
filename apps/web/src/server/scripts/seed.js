import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import Consent from "../models/consent.model.js";
import Feedback from "../models/feedback.model.js";
import FocusSession from "../models/focusSession.model.js";
import Notification from "../models/notification.model.js";
import Reflection from "../models/reflection.model.js";
import Routine from "../models/routine.model.js";
import User from "../models/user.model.js";

const PASSWORD = "Password123!";
const BATCH = `focus-demo-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const synthetic = { isSynthetic: true, seedBatch: BATCH };
const names = ["Aarav Mehta", "Aditi Rao", "Amelia Stone", "Arjun Shah", "Ava Martin", "Diya Kapoor", "Ethan Lee", "Fatima Khan", "Grace Miller", "Ishaan Patel", "Kavya Singh", "Liam Walker", "Maya Thomas", "Meera Gupta", "Mia Brown", "Noah Davis", "Olivia Taylor", "Priya Sharma", "Rahul Kumar", "Riya Jackson", "Samuel Harris", "Sophia Williams", "Vihaan Anderson", "Zara Wilson"];
const routineIdeas = [
  ["Open the document and write one rough line", "After making a morning drink"],
  ["Clear the desk for five minutes", "Before the first focus block"],
  ["Put the phone outside reach", "When the timer begins"],
  ["Choose tomorrow's first visible action", "Before closing the laptop"],
  ["Take a short screen-free reset", "After lunch"],
];
const feelings = ["clear", "steady", "stretched", "restless", "low"];

const clearPreviousDemo = async () => {
  const users = await User.find({ isSynthetic: true }).select("_id").lean();
  const ids = users.map((user) => user._id);
  await Promise.all([
    FocusSession.deleteMany({ userId: { $in: ids } }),
    Routine.deleteMany({ userId: { $in: ids } }),
    Reflection.deleteMany({ userId: { $in: ids } }),
    Feedback.deleteMany({ userId: { $in: ids } }),
    Notification.deleteMany({ userId: { $in: ids } }),
    Consent.deleteMany({ userId: { $in: ids } }),
  ]);
  await User.deleteMany({ isSynthetic: true });
};

try {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") throw new Error("Production seed is disabled");
  await connectDB();
  await clearPreviousDemo();
  const password = await bcrypt.hash(PASSWORD, 10);
  const members = await User.insertMany(names.map((name, index) => ({
    ...synthetic,
    name,
    email: `member${String(index + 1).padStart(3, "0")}@seed.curevo.com`,
    password,
    role: "member",
    emailVerifiedAt: new Date(),
    status: "active",
    bio: "Synthetic member account for testing the Curevo focus workspace.",
  })));
  const [admin] = await User.insertMany([{
    ...synthetic,
    name: "Curevo Seed Admin",
    email: "admin.seed@curevo.com",
    password,
    role: "admin",
    emailVerifiedAt: new Date(),
    status: "active",
  }]);

  const routines = await Routine.insertMany(members.flatMap((member, memberIndex) => routineIdeas.slice(0, 3).map(([title, cue], index) => ({
    ...synthetic,
    userId: member._id,
    title,
    cue,
    durationMinutes: [10, 25, 15][index],
    days: index === 2 ? ["mon", "wed", "fri"] : ["mon", "tue", "wed", "thu", "fri"],
    preferredTime: ["09:00", "09:20", "14:00"][index],
    color: ["forest", "clay", "amber", "sky", "plum"][(memberIndex + index) % 5],
    active: true,
    completionCount: 2 + ((memberIndex + index) % 9),
    lastCompletedAt: new Date(Date.now() - ((memberIndex + index) % 4) * 86_400_000),
  }))));

  const sessions = await FocusSession.insertMany(members.flatMap((member, memberIndex) => Array.from({ length: 8 }, (_, index) => {
    const startedAt = new Date();
    startedAt.setDate(startedAt.getDate() - index);
    startedAt.setHours(8 + (memberIndex % 5), 15, 0, 0);
    const durationMinutes = [10, 15, 25, 35, 45][(memberIndex + index) % 5];
    return { ...synthetic, userId: member._id, routineId: routines.find((routine) => routine.userId.equals(member._id))?._id, intention: routineIdeas[(memberIndex + index) % routineIdeas.length][0], durationMinutes, status: "completed", startedAt, completedAt: new Date(startedAt.getTime() + durationMinutes * 60_000), distractionCount: (memberIndex + index) % 4, closingNote: "Synthetic focus-session note." };
  })));

  const reflections = await Reflection.insertMany(members.flatMap((member, memberIndex) => Array.from({ length: 4 }, (_, index) => ({
    ...synthetic,
    userId: member._id,
    focusLevel: 1 + ((memberIndex + index) % 5),
    energyLevel: 1 + ((memberIndex + index * 2) % 5),
    feeling: feelings[(memberIndex + index) % feelings.length],
    win: "Starting with a deliberately rough first pass made the work quieter.",
    friction: "Too many open choices at the beginning.",
    nextStep: "Write the first visible action before stopping.",
    note: "Synthetic reflection for interface testing.",
    createdAt: new Date(Date.now() - index * 86_400_000),
  }))));

  const feedback = await Feedback.insertMany(members.slice(0, 8).map((member, index) => ({ ...synthetic, userId: member._id, category: ["feature", "bug", "content", "other"][index % 4], subject: `Synthetic focus workspace feedback ${index + 1}`, message: "This is synthetic feedback for administration interface testing.", status: index % 3 === 0 ? "in-review" : "open" })));
  await Consent.insertMany([...members, admin].map((user) => ({ ...synthetic, userId: user._id, type: "terms-and-privacy", policyVersion: "2026-08-03", accepted: true, source: "email-registration", acceptedAt: new Date() })));
  await Notification.insertMany(members.map((member, index) => ({ ...synthetic, userId: member._id, routineId: routines.find((routine) => routine.userId.equals(member._id))?._id, type: "routine-reminder", message: "Your chosen routine is available when it fits today.", safeLink: "/dashboard/routines", dedupKey: `seed:${BATCH}:${index}`, deliveryStatus: "sent", attempts: 1, deliveredAt: new Date() })));

  console.log(JSON.stringify({ batch: BATCH, members: members.length, admins: 1, routines: routines.length, focusSessions: sessions.length, reflections: reflections.length, feedback: feedback.length, password: PASSWORD }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
