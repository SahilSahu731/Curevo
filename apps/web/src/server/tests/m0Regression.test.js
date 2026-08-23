import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const repoRoot = path.resolve(root, "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const readRepo = (relative) => fs.readFileSync(path.join(repoRoot, relative), "utf8");
const walk = (directory) => fs.existsSync(directory)
  ? fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target);
    return /\.(js|jsx|ts|tsx)$/.test(entry.name) ? [target] : [];
  })
  : [];

test("public source keeps clear non-clinical product boundaries", () => {
  const publicRoots = ["src/app/(auth)", "src/app/(home)", "src/components/home"]
    .map((relative) => path.join(root, relative));
  const source = publicRoots.flatMap(walk).map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const forbidden = [
    /HIPAA (?:compliant|secure)/i,
    /GDPR compliant/i,
    /bank-grade/i,
    /AI-powered/i,
    /98% accuracy/i,
    /50K\+ assessments/i,
    /\bonline cure\b/i,
    /mental sickness/i,
    /AI therapist/i,
    /diagnos(?:e|is) your/i,
    /treats? (?:anxiety|depression|ADHD)/i,
  ];
  for (const claim of forbidden) assert.doesNotMatch(source, claim);
  assert.match(read("src/app/(home)/terms/page.tsx"), /does not provide medical advice/i);
});

test("the deployable source contains only the member and admin product roles", () => {
  const user = read("src/server/models/user.model.js");
  const schemas = read("src/server/validations/schemas.js");
  assert.match(user, /values: \["member", "admin"\]/);
  assert.match(schemas, /z\.literal\("member"\)/);
});

test("focus data is owner-scoped and exposed behind authentication", () => {
  const controller = read("src/server/controllers/focus.controller.js");
  const routes = read("src/server/routes/focus.routes.js");
  assert.match(controller, /const owned = \(userId, id\)/);
  assert.match(controller, /userId: req\.user\._id/g);
  assert.match(routes, /router\.use\(protect\)/);
  assert.match(routes, /requireVerifiedEmail/);
});

test("review deployments are noindex and production writes are opt-in", () => {
  assert.match(read("src/app/robots.ts"), /NEXT_PUBLIC_ALLOW_INDEXING/);
  assert.match(readRepo("render.yaml"), /ALLOW_PRODUCTION_WRITES[\s\S]*"false"/);
});

test("runtime origin is resolved after env loading so OAuth returns to the configured port", () => {
  const server = read("server.ts");
  const envLoadedAt = server.indexOf('dotenv.config({ path: path.join(webRoot, ".env")');
  const portResolvedAt = server.indexOf("const port = Number(process.env.PORT || 3000)");
  assert.ok(envLoadedAt >= 0, "server must load its project environment");
  assert.ok(portResolvedAt > envLoadedAt, "server must resolve PORT after loading the environment");
  assert.match(server, /process\.env\.CLIENT_URL = localOrigin/);
  assert.match(server, /process\.env\.GOOGLE_CALLBACK_URL = `\$\{localOrigin\}\/api\/auth\/google\/callback`/);
});
