import assert from "node:assert/strict";
import test from "node:test";
import { validateUploadSignature } from "../middlewares/upload.middleware.js";

const invoke = (mimetype, buffer) => {
  const req = { file: { mimetype, buffer: Buffer.from(buffer) } };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  validateUploadSignature(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
};

test("accepts an image with matching signature and valid dimensions", () => {
  const png = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png);
  png.writeUInt32BE(320, 16);
  png.writeUInt32BE(320, 20);
  assert.equal(invoke("image/png", png).nextCalled, true);
});

test("rejects spoofed upload contents and clears the buffer", () => {
  const result = invoke("image/png", Buffer.from("<script>alert(1)</script>"));
  assert.equal(result.nextCalled, false);
  assert.equal(result.res.statusCode, 415);
  assert.equal(result.req.file, undefined);
});
