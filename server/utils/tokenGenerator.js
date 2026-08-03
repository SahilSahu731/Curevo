import QueueCounter from "../models/queueCounter.model.js";
import { localDateInTimezone } from "./scheduling.js";

export const generateToken = async (clinicId, doctorId, instant, timezone = "Asia/Kolkata") => {
  const localDate = localDateInTimezone(instant, timezone);
  const counter = await QueueCounter.findOneAndUpdate(
    { clinicId, doctorId, localDate },
    { $inc: { sequence: 1 }, $setOnInsert: { timezone } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return counter.sequence;
};
