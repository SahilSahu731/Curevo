import assert from "node:assert/strict";
import test from "node:test";
import { createRoomGrant, verifyRoomGrant } from "../utils/roomGrant.js";
import { createTelehealthRoomId, isLegacyRoomId, isTelehealthWindowOpen } from "../utils/telehealth.js";

process.env[["SESSION", "SECRET"].join("_")] = "m2-test-session-secret";

test("room grants are signed, scoped, and short lived", () => {
  const grant = createRoomGrant({ appointmentId: "507f1f77bcf86cd799439011", roomId: createTelehealthRoomId(), userId: "507f1f77bcf86cd799439012", role: "patient", grantVersion: 3, ttlSeconds: 30 });
  const decoded = verifyRoomGrant(grant);
  assert.equal(decoded.role, "patient");
  assert.equal(decoded.grantVersion, 3);
  assert.equal(verifyRoomGrant(`${grant.slice(0, -1)}${grant.endsWith("A") ? "B" : "A"}`), null);
});

test("telehealth rooms use opaque identifiers and enforce the appointment window", () => {
  const room = createTelehealthRoomId();
  assert.equal(room.length >= 16, true);
  assert.equal(isLegacyRoomId(room), false);
  assert.equal(isLegacyRoomId("curevo-room-00001"), true);
  const now = new Date("2026-08-03T04:30:00.000Z");
  const appointment = { date: "2026-08-03T00:00:00.000Z", slotTime: "10:00", status: "booked" };
  assert.equal(isTelehealthWindowOpen(appointment, now), true);
  assert.equal(isTelehealthWindowOpen(appointment, new Date("2026-08-03T06:01:00.000Z")), false);
});
