import crypto from "node:crypto";

export const TELEHEALTH_POLICY_VERSION = "2026-08-03";
export const TELEHEALTH_START_GRACE_MS = 15 * 60 * 1000;
export const TELEHEALTH_DURATION_MS = 90 * 60 * 1000;

export const createTelehealthRoomId = () => crypto.randomBytes(18).toString("base64url");

const parseSlotTime = (value) => {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (minute > 59 || hour > 23) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "AM" && hour === 12) hour = 0;
    if (meridiem === "PM" && hour !== 12) hour += 12;
  }
  return { hour, minute };
};

export const appointmentStart = (appointment) => {
  const date = new Date(appointment.date);
  const slot = parseSlotTime(appointment.slotTime);
  if (Number.isNaN(date.getTime()) || !slot) return null;
  date.setHours(slot.hour, slot.minute, 0, 0);
  return date;
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
