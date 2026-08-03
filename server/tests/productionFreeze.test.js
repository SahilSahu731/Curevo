import assert from "node:assert/strict";
import test from "node:test";
import { enforceProductionFreeze } from "../middlewares/productionFreeze.middleware.js";

const invoke = ({ method, path, allowWrites = false }) => {
  const previous = { nodeEnv: process.env.NODE_ENV, allow: process.env.ALLOW_PRODUCTION_WRITES };
  process.env.NODE_ENV = "production";
  process.env.ALLOW_PRODUCTION_WRITES = allowWrites ? "true" : "false";
  let nextCalled = false;
  const response = {
    statusCode: 200,
    headers: {},
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  enforceProductionFreeze({ method, baseUrl: "/api", path }, response, () => { nextCalled = true; });
  process.env.NODE_ENV = previous.nodeEnv;
  if (previous.allow === undefined) delete process.env.ALLOW_PRODUCTION_WRITES;
  else process.env.ALLOW_PRODUCTION_WRITES = previous.allow;
  return { response, nextCalled };
};

test("production freeze blocks health-data writes", () => {
  const { response, nextCalled } = invoke({ method: "POST", path: "/appointments" });
  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, "PRODUCTION_REVIEW_ONLY");
});

test("production freeze permits reads and existing-account sign-in", () => {
  assert.equal(invoke({ method: "GET", path: "/appointments" }).nextCalled, true);
  assert.equal(invoke({ method: "POST", path: "/auth/login" }).nextCalled, true);
  assert.equal(invoke({ method: "GET", path: "/auth/logout" }).nextCalled, true);
});

test("explicit approval flag enables writes", () => {
  assert.equal(invoke({ method: "POST", path: "/appointments", allowWrites: true }).nextCalled, true);
});
