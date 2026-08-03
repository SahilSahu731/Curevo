import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import QueueCounter from "../models/queueCounter.model.js";
import SlotReservation from "../models/slotReservation.model.js";
import { generateToken } from "../utils/tokenGenerator.js";

const doctorId = new mongoose.Types.ObjectId();
const clinicId = new mongoose.Types.ObjectId();
const patientId = new mongoose.Types.ObjectId();
const slotStartUtc = new Date("2035-01-15T04:30:00.000Z");
const slotEndUtc = new Date("2035-01-15T05:00:00.000Z");

try {
  await connectDB();
  await Promise.all([SlotReservation.createIndexes(), QueueCounter.createIndexes()]);
  const attempts = await Promise.allSettled(Array.from({ length: 100 }, (_, index) => SlotReservation.create({
    doctorId, clinicId, patientId: index === 0 ? patientId : new mongoose.Types.ObjectId(), slotStartUtc, slotEndUtc, expiresAt: new Date("2035-01-16T00:00:00.000Z"),
  })));
  const winners = attempts.filter(({ status }) => status === "fulfilled").length;
  const conflicts = attempts.filter(({ status, reason }) => status === "rejected" && reason?.code === 11000).length;
  const tokens = await Promise.all(Array.from({ length: 100 }, () => generateToken(clinicId, doctorId, slotStartUtc, "Asia/Kolkata")));
  const uniqueTokens = new Set(tokens);
  if (winners !== 1 || conflicts !== 99) throw new Error(`Slot race failed: ${winners} winners and ${conflicts} conflicts`);
  if (uniqueTokens.size !== 100 || Math.min(...tokens) !== 1 || Math.max(...tokens) !== 100) throw new Error("Token counter race failed");
  console.log(JSON.stringify({ simultaneousRequests: 100, slotWinners: winners, slotConflicts: conflicts, uniqueTokens: uniqueTokens.size, tokenRange: [Math.min(...tokens), Math.max(...tokens)] }));
} catch (error) {
  console.error(error.message); process.exitCode = 1;
} finally {
  await Promise.all([SlotReservation.deleteMany({ doctorId, clinicId }), QueueCounter.deleteMany({ doctorId, clinicId })]).catch(() => {});
  await mongoose.disconnect().catch(() => {});
}
