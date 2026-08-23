import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("journal content is stored as constrained blocks instead of executable HTML", () => {
  const model = read("src/server/models/blogPost.model.js");
  const schemas = read("src/server/validations/schemas.js");
  assert.match(model, /enum: \["paragraph", "heading-2", "heading-3", "quote", "callout", "bulleted-list", "numbered-list", "divider"\]/);
  assert.match(model, /status: \{ type: String, enum: \["draft", "published", "archived"\]/);
  assert.match(schemas, /blocks: z\.array\(blogBlock\)\.max\(200\)/);
  assert.doesNotMatch(model, /dangerouslySetInnerHTML|<script/i);
});

test("public journal reads only published content and admin mutations remain protected", () => {
  const controller = read("src/server/controllers/blog.controller.js");
  const adminRoutes = read("src/server/routes/admin.routes.js");
  assert.match(controller, /status: "published", publishedAt: \{ \$lte: new Date\(\) \}/g);
  assert.match(adminRoutes, /router\.use\(protect\)/);
  assert.match(adminRoutes, /router\.use\(authorize\('admin'\)\)/);
  assert.match(adminRoutes, /router\.post\('\/blog', validate\(adminSchemas\.blogCreate\), createPost\)/);
  assert.match(adminRoutes, /router\.delete\('\/blog\/:id'.*archivePost\)/);
});

test("content changes are auditable and deletion uses an archive state", () => {
  const controller = read("src/server/controllers/blog.controller.js");
  assert.match(controller, /writeAuditEvent\(req, "blog-create"/);
  assert.match(controller, /writeAuditEvent\(req, "blog-update"/);
  assert.match(controller, /writeAuditEvent\(req, "blog-archive"/);
  assert.match(controller, /\{ status: "archived", lastEditedBy: req\.user\._id \}/);
});
