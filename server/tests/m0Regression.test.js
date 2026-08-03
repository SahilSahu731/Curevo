import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  if (entry.isDirectory()) return walk(target);
  return /\.(js|jsx|ts|tsx)$/.test(entry.name) ? [target] : [];
});

test("public source excludes quarantined claims", () => {
  const publicRoots = [
    "client/src/app/(auth)",
    "client/src/app/(home)",
    "client/src/components/home",
    "client/src/components/health-check",
  ].map((relative) => path.join(root, relative));
  const source = publicRoots.flatMap(walk).map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const forbidden = [
    /HIPAA (?:compliant|secure)/i,
    /GDPR compliant/i,
    /bank-grade/i,
    /enterprise-grade/i,
    /AI-powered/i,
    /AI model/i,
    /98% accuracy/i,
    /50K\+ assessments/i,
    /trusted by (?:thousands|leading healthcare providers)/i,
    /world-class care/i,
    /top-rated (?:doctor|clinic)/i,
    /state-of-the-art medical/i,
    /ISO 9001:2015 certified/i,
    /10,000\+ patients/i,
    /instant SMS alerts/i,
  ];
  for (const claim of forbidden) assert.doesNotMatch(source, claim);
});

test("assessment limitations precede questions and appear in PDF", () => {
  const modal = read("client/src/components/health-check/AssessmentModal.tsx");
  assert.ok(modal.indexOf("This is an unvalidated educational calculator") < modal.indexOf("currentQ.text"));
  assert.match(read("client/src/lib/healthCalculations.ts"), /Unvalidated fixed-rule output/);
  assert.match(read("client/src/app/(home)/health-check/page.tsx"), /NEXT_PUBLIC_ENABLE_WELLNESS_TOOLS/);
});

test("Socket.IO requires identity and appointment authorization", () => {
  const socket = read("server/config/socket.js");
  assert.match(socket, /io\.use\(/);
  assert.match(socket, /findSession/);
  assert.match(socket, /authorizeAppointment/);
  assert.match(socket, /verifyRoomGrant/);
  assert.match(socket, /participants\.length >= 2/);
  assert.match(socket, /telehealthRooms\.has\(data\.roomId\)/);
  assert.match(socket, /consent\?\.accepted/);
  assert.match(socket, /maxHttpBufferSize/);
  assert.match(socket, /connectionAllowed/);
});

test("review deployments are noindex and production writes are opt-in", () => {
  assert.match(read("client/src/app/robots.ts"), /NEXT_PUBLIC_ALLOW_INDEXING/);
  assert.match(read("render.yaml"), /ALLOW_PRODUCTION_WRITES[\s\S]*"false"/);
});

test("reviews require completed visits and public clinician responses omit license data", () => {
  assert.match(read("server/controllers/review.controller.js"), /status: "completed"/);
  assert.match(read("server/controllers/clinicReview.controller.js"), /status: "completed"/);
  assert.match(read("server/controllers/queue.controller.js"), /Not authorized to view this queue position/);
  assert.match(read("server/controllers/doctor.controller.js"), /select\('userId clinicId specialization qualification experience consultationFee isAvailable availability createdAt updatedAt isSynthetic'\)/);
});
