import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidTimezone = (timezone) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
};

export const normalizeLocalDate = (value) => {
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value || "").slice(0, 10);
  if (!DATE_RE.test(text)) throw Object.assign(new Error("date must be YYYY-MM-DD"), { statusCode: 400 });
  const [year, month, day] = text.split("-").map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw Object.assign(new Error("Invalid calendar date"), { statusCode: 400 });
  }
  return text;
};

export const normalizeTime = (value) => {
  const text = String(value || "").trim().toUpperCase();
  const twelve = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  const twentyFour = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!twelve && !twentyFour) throw Object.assign(new Error("time must use HH:mm or h:mm AM/PM"), { statusCode: 400 });
  let hour = Number((twelve || twentyFour)[1]);
  const minute = Number((twelve || twentyFour)[2]);
  if (minute > 59 || (twelve ? hour < 1 || hour > 12 : hour > 23)) {
    throw Object.assign(new Error("Invalid time"), { statusCode: 400 });
  }
  if (twelve) {
    if (hour === 12) hour = 0;
    if (twelve[3] === "PM") hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const partsAt = (instant, timezone) => Object.fromEntries(
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(instant).filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]),
);

export const localDateTimeToUtc = (localDate, localTime, timezone) => {
  if (!isValidTimezone(timezone)) throw Object.assign(new Error("Clinic timezone is invalid"), { statusCode: 422 });
  const date = normalizeLocalDate(localDate);
  const time = normalizeTime(localTime);
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let result = desired;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = partsAt(new Date(result), timezone);
    const represented = Date.UTC(Number(actual.year), Number(actual.month) - 1, Number(actual.day), Number(actual.hour), Number(actual.minute));
    result += desired - represented;
  }
  const finalParts = partsAt(new Date(result), timezone);
  if (`${finalParts.year}-${finalParts.month}-${finalParts.day}` !== date || `${finalParts.hour}:${finalParts.minute}` !== time) {
    throw Object.assign(new Error("The selected local time does not exist in this timezone"), { statusCode: 400 });
  }
  return new Date(result);
};

export const localDateInTimezone = (instant, timezone) => {
  const parts = partsAt(new Date(instant), timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const localDayRangeUtc = (localDate, timezone) => {
  const start = localDateTimeToUtc(localDate, "00:00", timezone);
  const next = new Date(`${normalizeLocalDate(localDate)}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);
  return { start, end: localDateTimeToUtc(nextDate, "00:00", timezone), nextDate };
};

const minutes = (time) => {
  const [hour, minute] = normalizeTime(time).split(":").map(Number);
  return hour * 60 + minute;
};
const timeFromMinutes = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const overlaps = (start, end, rangeStart, rangeEnd) => start < rangeEnd && end > rangeStart;

export const getDoctorOnboardingState = (doctor, now = new Date()) => {
  if (!doctor) return "account-created";
  if (doctor.verification?.status === "suspended") return "suspended";
  if (doctor.verification?.status === "approved" && doctor.verification?.expiresAt && new Date(doctor.verification.expiresAt) <= now) return "expired";
  if (doctor.verification?.status && doctor.verification.status !== "not-submitted") return doctor.verification.status;
  const complete = Boolean(doctor.specialization && doctor.qualification && doctor.clinicId && doctor.experience !== undefined && doctor.consultationFee !== undefined);
  return complete ? "not-submitted" : "profile-incomplete";
};

export const isDoctorBookable = (doctor, clinic, now = new Date()) => (
  Boolean(doctor && clinic && clinic.isActive && doctor.isAvailable)
  && getDoctorOnboardingState(doctor, now) === "approved"
  && Boolean(doctor.verification?.licenseFileUrl)
);

export const evaluateSlot = async ({ doctor, clinic, localDate, slotTime, consultationType = "in-person", now = new Date(), excludeAppointmentId }) => {
  const timezone = clinic.timezone || "Asia/Kolkata";
  const date = normalizeLocalDate(localDate);
  const time = normalizeTime(slotTime);
  if (!isDoctorBookable(doctor, clinic, now)) throw Object.assign(new Error("This clinician is not eligible for booking"), { statusCode: 409 });
  const assignedClinicId = doctor.clinicId?._id || doctor.clinicId;
  if (assignedClinicId.toString() !== clinic._id.toString()) throw Object.assign(new Error("Clinician is not assigned to this clinic"), { statusCode: 400 });
  if (!(clinic.supportedConsultationTypes || ["in-person", "video"]).includes(consultationType)) throw Object.assign(new Error("Consultation type is not offered by this clinic"), { statusCode: 400 });

  const startUtc = localDateTimeToUtc(date, time, timezone);
  const duration = doctor.availability?.slotDuration || clinic.averageConsultationTime;
  const endUtc = new Date(startUtc.getTime() + duration * 60_000);
  const dayName = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
  const days = doctor.availability?.days?.length ? doctor.availability.days : clinic.workingDays;
  if (!days.includes(dayName) || !clinic.workingDays.includes(dayName)) throw Object.assign(new Error("Clinic or clinician is closed on this day"), { statusCode: 409 });

  const startMinute = minutes(time);
  const endMinute = startMinute + duration;
  const open = minutes(doctor.availability?.startTime || clinic.openingTime);
  const close = minutes(doctor.availability?.endTime || clinic.closingTime);
  if (startMinute < open || endMinute > close) throw Object.assign(new Error("Slot is outside working hours"), { statusCode: 409 });
  if ((clinic.breakSlots || []).some((item) => overlaps(startMinute, endMinute, minutes(item.startTime), minutes(item.endTime)))) throw Object.assign(new Error("Slot overlaps a clinic break"), { statusCode: 409 });
  if ((doctor.blockedSlots || []).some((item) => localDateInTimezone(item.date, timezone) === date && overlaps(startMinute, endMinute, minutes(item.startTime), minutes(item.endTime)))) throw Object.assign(new Error("Slot is blocked by the clinician"), { statusCode: 409 });
  if ((doctor.leavePeriods || []).some((item) => startUtc < new Date(item.endAt) && endUtc > new Date(item.startAt))) throw Object.assign(new Error("Clinician is on leave"), { statusCode: 409 });

  const today = localDateInTimezone(now, timezone);
  const todayStart = localDateTimeToUtc(today, "00:00", timezone);
  const horizonEnd = new Date(todayStart.getTime() + (clinic.bookingHorizonDays || 90) * 86_400_000);
  if (startUtc <= now) throw Object.assign(new Error("Appointments cannot be booked in the past"), { statusCode: 400 });
  if (startUtc > horizonEnd) throw Object.assign(new Error("Appointment is beyond the booking horizon"), { statusCode: 400 });

  const { start: dayStart, end: dayEnd } = localDayRangeUtc(date, timezone);
  const activeQuery = { doctorId: doctor._id, clinicId: clinic._id, slotStartUtc: mongoose.trusted({ $gte: dayStart, $lt: dayEnd }), status: mongoose.trusted({ $in: ["booked", "waiting", "in-progress"] }) };
  if (excludeAppointmentId) activeQuery._id = mongoose.trusted({ $ne: excludeAppointmentId });
  const [dailyCount, conflict] = await Promise.all([
    Appointment.countDocuments(activeQuery).setOptions({ sanitizeFilter: false }),
    Appointment.exists({ ...activeQuery, slotStartUtc: startUtc }).setOptions({ sanitizeFilter: false }),
  ]);
  if (dailyCount >= clinic.maxPatientsPerDay) throw Object.assign(new Error("Daily appointment capacity has been reached"), { statusCode: 409 });
  if (conflict) throw Object.assign(new Error("Slot already booked"), { statusCode: 409 });
  return { localDate: date, slotTime: time, timezone, startUtc, endUtc, duration };
};

export const listAvailableSlots = async ({ doctor, clinic, localDate, consultationType, now = new Date() }) => {
  const start = minutes(doctor.availability?.startTime || clinic.openingTime);
  const close = minutes(doctor.availability?.endTime || clinic.closingTime);
  const duration = doctor.availability?.slotDuration || clinic.averageConsultationTime;
  const step = duration + (clinic.slotBufferMinutes || 0);
  const slots = [];
  for (let cursor = start; cursor + duration <= close; cursor += step) {
    const time = timeFromMinutes(cursor);
    try {
      const slot = await evaluateSlot({ doctor, clinic, localDate, slotTime: time, consultationType, now });
      slots.push({ time, startUtc: slot.startUtc, endUtc: slot.endUtc, timezone: slot.timezone });
    } catch {
      // A slot rejected by the booking policy is intentionally omitted.
    }
  }
  return slots;
};
