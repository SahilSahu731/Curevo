import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";

import FocusSession from "../models/focusSession.model.js";
import Reflection from "../models/reflection.model.js";
import Routine from "../models/routine.model.js";
import { focusSchemas } from "../validations/focus.schemas.js";

const userId = new mongoose.Types.ObjectId();

test("focus models accept bounded member-owned records", () => {
  assert.equal(new FocusSession({ userId, intention: "Draft the opening", durationMinutes: 25 }).validateSync(), undefined);
  assert.equal(new Routine({ userId, title: "Morning reset", days: ["mon"], preferredTime: "08:30" }).validateSync(), undefined);
  assert.equal(new Reflection({ userId, focusLevel: 3, energyLevel: 2, feeling: "steady" }).validateSync(), undefined);
});

test("reflection and session bounds reject score-like or runaway values", () => {
  assert.ok(new Reflection({ userId, focusLevel: 6, energyLevel: 0, feeling: "diagnosed" }).validateSync());
  assert.ok(new FocusSession({ userId, intention: "x", durationMinutes: 999 }).validateSync());
});

test("focus inputs are strict and pagination is capped", () => {
  assert.equal(focusSchemas.createReflection.safeParse({ body: { focusLevel: 3, energyLevel: 3, feeling: "clear", diagnosis: "none" } }).success, false);
  assert.equal(focusSchemas.list.safeParse({ query: { page: "1", limit: "101" } }).success, false);
  const parsed = focusSchemas.createRoutine.safeParse({ body: { title: "Clear the desk" } });
  assert.equal(parsed.success, true);
  assert.deepEqual(parsed.data.body.days, ["mon", "tue", "wed", "thu", "fri"]);
});
