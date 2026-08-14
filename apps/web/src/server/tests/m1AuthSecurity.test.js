import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import "../config/db.js";
import Session from "../models/session.model.js";
import { issueCsrfToken, validateCsrf } from "../middlewares/csrf.middleware.js";
import { safeRelativeRedirect } from "../middlewares/oauthState.middleware.js";
import { rejectOperatorInjection } from "../middlewares/requestSecurity.middleware.js";
import { cookieOptions } from "../utils/session.js";
import { accountLink } from "../utils/mail.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const sessionSecretKey = ["SESSION", "SECRET"].join("_");

test("OAuth redirects accept only same-site relative paths", () => {
  assert.equal(safeRelativeRedirect("/book?doctorId=123"), "/book?doctorId=123");
  assert.equal(safeRelativeRedirect("/queue/abc#status"), "/queue/abc#status");
  assert.equal(safeRelativeRedirect("https://attacker.example/phish"), "");
  assert.equal(safeRelativeRedirect("//attacker.example/phish"), "");
  assert.equal(safeRelativeRedirect("/\\\\attacker.example"), "");
});

test("request security rejects Mongo-style operator and prototype keys", () => {
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  let nextCalled = false;
  rejectOperatorInjection({ body: { profile: { $where: "true" } }, query: {}, params: {} }, response, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 400);
});

test("CSRF middleware requires a matching signed cookie, header, and allowed origin", () => {
  const previousSecret = process.env[sessionSecretKey];
  const previousClient = process.env.CLIENT_URL;
  process.env[sessionSecretKey] = "m1-test-secret";
  process.env.CLIENT_URL = "http://localhost:3000";
  const response = { cookies: {}, statusCode: 200, cookie(name, value) { this.cookies[name] = value; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  issueCsrfToken({}, response);
  const token = response.body.csrfToken;
  const request = { method: "POST", cookies: { curevo_csrf: response.cookies.curevo_csrf }, get(name) { return ({ origin: "http://localhost:3000", "x-csrf-token": token })[name.toLowerCase()]; } };
  let nextCalled = false;
  validateCsrf(request, response, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  const rejected = { ...request, get(name) { return ({ origin: "https://attacker.example", "x-csrf-token": token })[name.toLowerCase()]; } };
  nextCalled = false;
  validateCsrf(rejected, response, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 403);
  if (previousSecret === undefined) delete process.env[sessionSecretKey]; else process.env[sessionSecretKey] = previousSecret;
  if (previousClient === undefined) delete process.env.CLIENT_URL; else process.env.CLIENT_URL = previousClient;
});

test("authentication state is not persisted in browser storage", () => {
  const store = read("src/store/authStore.ts");
  const client = read("src/api/client.ts");
  assert.doesNotMatch(store, /localStorage|sessionStorage|persist\(/);
  assert.doesNotMatch(client, /Authorization/);
  assert.match(read("src/proxy.ts"), /curevo_session/);
});

test("production cookies are explicit and session metadata is server-side", () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const options = cookieOptions(60_000);
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.path, "/");
  assert.equal(options.maxAge, 60_000);
  process.env.NODE_ENV = previousEnv;
  assert.match(read("src/server/models/session.model.js"), /tokenHash/);
  assert.match(read("src/server/models/session.model.js"), /revokedAt/);
});

test("server-authored Mongo operators remain usable behind request validation", () => {
  assert.equal(mongoose.get("sanitizeFilter"), false);
  const cutoff = new Date("2026-08-14T00:00:00.000Z");
  const filter = Session.findOne({ expiresAt: { $gt: cutoff } }).cast(Session);
  assert.deepEqual(filter, { expiresAt: { $gt: cutoff } });
  assert.match(read("src/server/index.js"), /rejectOperatorInjection/);
});

test("one-time account links keep raw tokens out of request URLs", () => {
  const previousClient = process.env.CLIENT_URL;
  process.env.CLIENT_URL = "http://localhost:3000";
  const link = accountLink("/reset-password", "one-time-token");
  assert.match(link, /#token=one-time-token$/);
  assert.doesNotMatch(link, /\?token=/);
  if (previousClient === undefined) delete process.env.CLIENT_URL; else process.env.CLIENT_URL = previousClient;
});
