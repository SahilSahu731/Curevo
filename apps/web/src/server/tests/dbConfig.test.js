import assert from "node:assert/strict";
import test from "node:test";

import { normalizeMongoUriCredentials } from "../config/db.js";

test("Atlas credentials are URL-encoded without changing the SRV host", () => {
  const normalized = normalizeMongoUriCredentials("mongodb+srv://writer:word@with-symbol@cluster0.example.mongodb.net/curevo?retryWrites=true");
  assert.equal(normalized, "mongodb+srv://writer:word%40with-symbol@cluster0.example.mongodb.net/curevo?retryWrites=true");
});

test("already encoded Atlas credentials remain stable", () => {
  const uri = "mongodb+srv://writer:word%40encoded@cluster0.example.mongodb.net/curevo";
  assert.equal(normalizeMongoUriCredentials(uri), uri);
});
