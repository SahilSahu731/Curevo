import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { inspectUpload, validateUploadSignature } from "../middlewares/upload.middleware.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("medical record projections separate private notes and prevent finalized overwrite", () => {
  const controller = read("server/controllers/medicalRecord.controller.js");
  const model = read("server/models/medicalRecord.model.js");
  assert.match(controller, /delete data\.doctorNotes/);
  assert.match(controller, /ClinicalNote/);
  assert.match(controller, /record\.finalizedAt/);
  assert.match(controller, /breakGlassReason/);
  assert.match(model, /patientInstructions/);
  assert.match(model, /doctorNotes: \{ type: String, trim: true, select: false \}/);
  assert.match(read("server/controllers/privacy.controller.js"), /-doctorNotes -attachments\.url -attachments\.storageKey/);
  assert.doesNotMatch(read("client/src/app/(patient)/patient-dashboard/records/page.tsx"), /doctorNotes|clinicianPrivateNotes/);
});

test("record routes scope doctors and attachments server-side", () => {
  const routes = read("server/routes/medicalRecord.routes.js");
  assert.match(routes, /\.post\(authorize\("doctor"\)/);
  assert.match(routes, /attachments/);
  assert.match(routes, /requireVerifiedEmail/);
  assert.match(read("server/controllers/privacy.controller.js"), /anonymized-retained-records/);
});

test("uploads use signatures, dimensions, and purpose validators", () => {
  const png = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png);
  png.writeUInt32BE(100, 16); png.writeUInt32BE(100, 20);
  const inspected = inspectUpload({ mimetype: "image/png", buffer: png });
  assert.equal(inspected.type, "image/png");
  assert.deepEqual(inspected.dimensions, { width: 100, height: 100 });
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  const req = { file: { mimetype: "application/pdf", buffer: png } };
  validateUploadSignature(req, response, () => { throw new Error("spoofed file accepted"); });
  assert.equal(response.statusCode, 415);
  assert.equal(req.file, undefined);
});

test("production logs use request paths rather than query strings", () => {
  assert.match(read("server/index.js"), /morgan\(\(tokens, req, res\) => .*req\.path/);
  assert.doesNotMatch(read("server/index.js"), /morgan\(':method :url/);
});
