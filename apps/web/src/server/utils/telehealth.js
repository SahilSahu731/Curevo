import crypto from "node:crypto";
import { localDateTimeToUtc, normalizeLocalDate, normalizeTime } from "./scheduling.js";

export const TELEHEALTH_POLICY_VERSION = "2026-08-03";
export const TELEHEALTH_START_GRACE_MS = 15 * 60 * 1000;
export const TELEHEALTH_DURATION_MS = 90 * 60 * 1000;

export const createTelehealthRoomId = () => crypto.randomBytes(18).toString("base64url");

export const appointmentStart = (appointment) => {
  if (appointment?.slotStartUtc) {
    const start = new Date(appointment.slotStartUtc);
    return Number.isNaN(start.getTime()) ? null : start;
  }
  try {
    return localDateTimeToUtc(normalizeLocalDate(appointment.date), normalizeTime(appointment.slotTime), appointment.clinicTimezone || "Asia/Kolkata");
  } catch {
    return null;
  }
};

export const isTelehealthWindowOpen = (appointment, now = new Date()) => {
  if (!appointment || !["booked", "waiting", "in-progress"].includes(appointment.status)) return false;
  const start = appointmentStart(appointment);
  if (!start) return false;
  const timestamp = now.getTime();
  return timestamp >= start.getTime() - TELEHEALTH_START_GRACE_MS
    && timestamp <= start.getTime() + TELEHEALTH_DURATION_MS;
};

export const isLegacyRoomId = (roomId) => /^(?:curevo|curevo-room)-/i.test(String(roomId || ""));
