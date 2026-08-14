import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { adminSchemas, supportSchemas } from "../validations/schemas.js";
import { authorizeAdminScope } from "../middlewares/auth.middleware.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("M5 support requests enforce strict categories and size limits", () => {
  assert.equal(supportSchemas.create.safeParse({ body: { name: "Sahil", email: "sahil@example.com", category: "product", subject: "Cannot open profile", message: "The profile page does not load after I sign in.", website: "" } }).success, true);
  assert.equal(supportSchemas.create.safeParse({ body: { name: "S", email: "bad", category: "urgent-medical", subject: "x", message: "short" } }).success, false);
  assert.equal(supportSchemas.create.safeParse({ body: { name: "Sahil", email: "sahil@example.com", category: "product", subject: "Valid subject", message: "A".repeat(3001) } }).success, false);
});

test("M5 admin mutations require target identity and a meaningful reason", () => {
  const valid = { params: { id: "64b000000000000000000001" }, body: { role: "doctor", targetEmail: "target@example.com", reason: "Approved role correction request" } };
  assert.equal(adminSchemas.userUpdate.safeParse(valid).success, true);
  assert.equal(adminSchemas.userUpdate.safeParse({ ...valid, body: { ...valid.body, reason: "short" } }).success, false);
  assert.equal(adminSchemas.userDeactivate.safeParse({ params: valid.params, body: { targetEmail: "target@example.com", reason: "Confirmed policy suspension" } }).success, true);
});

test("M5 administrator scopes deny health or identity actions by default", () => {
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  let nextCalled = false;
  authorizeAdminScope("compliance", "super-admin")({ user: { role: "admin", adminScope: "operations" } }, response, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 403);
  authorizeAdminScope("operations")({ user: { role: "admin", adminScope: "operations" } }, response, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test("M5 removes simulated commerce and fake admin success controls", () => {
  assert.doesNotMatch(read("src/app/(home)/lab-tests/page.tsx"), /Confirm Booking|Successfully booked|setTimeout/);
  assert.doesNotMatch(read("src/app/(home)/medicines/page.tsx"), /Add to cart|added to cart|ShoppingCart|originalPrice/);
  assert.doesNotMatch(read("src/app/(admin)/admin-dashboard/page.tsx"), /Generate Report/);
  assert.match(read("src/server/controllers/admin.controller.js"), /last active administrator/i);
});

test("M5 contact tickets persist a reference and distinguish delivery", () => {
  const controller = read("src/server/controllers/support.controller.js");
  assert.match(controller, /SupportTicket\.create/);
  assert.match(controller, /reference/);
  assert.match(controller, /delivered/);
  assert.match(read("src/server/models/supportTicket.model.js"), /expireAfterSeconds/);
});
