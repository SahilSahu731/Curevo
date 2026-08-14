import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionAppointment } from "../services/appointmentState.service.js";
import { getDoctorOnboardingState, isDoctorBookable, localDateInTimezone, localDateTimeToUtc, normalizeLocalDate, normalizeTime } from "../utils/scheduling.js";

test("M4 scheduling normalizes accepted times and rejects malformed values", () => {
  assert.equal(normalizeTime("9:05 am"), "09:05");
  assert.equal(normalizeTime("23:45"), "23:45");
  assert.equal(normalizeLocalDate("2026-02-28"), "2026-02-28");
  assert.throws(() => normalizeTime("25:00"), /Invalid time/);
  assert.throws(() => normalizeLocalDate("2026-02-30"), /Invalid calendar date/);
});

test("M4 timezone conversion handles non-hour offsets and midnight boundaries", () => {
  assert.equal(localDateTimeToUtc("2026-08-03", "09:30", "Asia/Kathmandu").toISOString(), "2026-08-03T03:45:00.000Z");
  assert.equal(localDateInTimezone(new Date("2026-08-02T19:00:00.000Z"), "Asia/Kolkata"), "2026-08-03");
});

test("M4 timezone conversion rejects a DST spring-forward gap", () => {
  assert.throws(() => localDateTimeToUtc("2026-03-08", "02:30", "America/New_York"), /does not exist/);
  assert.equal(localDateTimeToUtc("2026-11-01", "01:30", "America/New_York") instanceof Date, true);
});

test("M4 doctor onboarding and booking eligibility are explicit", () => {
  assert.equal(getDoctorOnboardingState(null), "account-created");
  assert.equal(getDoctorOnboardingState({ verification: { status: "rejected" } }), "rejected");
  assert.equal(getDoctorOnboardingState({ verification: { status: "approved", expiresAt: new Date(0) } }), "expired");
  const doctor = { isAvailable: true, verification: { status: "approved", licenseFileUrl: "private-artifact" } };
  assert.equal(isDoctorBookable(doctor, { isActive: true }), true);
  assert.equal(isDoctorBookable({ ...doctor, verification: { status: "suspended", licenseFileUrl: "private-artifact" } }, { isActive: true }), false);
});

test("M4 appointment state machine enforces role and terminal states", () => {
  assert.equal(canTransitionAppointment("booked", "waiting", "patient"), true);
  assert.equal(canTransitionAppointment("booked", "completed", "doctor"), false);
  assert.equal(canTransitionAppointment("waiting", "in-progress", "patient"), false);
  assert.equal(canTransitionAppointment("waiting", "in-progress", "doctor"), true);
  assert.equal(canTransitionAppointment("completed", "booked", "admin"), false);
});
