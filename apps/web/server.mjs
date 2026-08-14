import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import mongoose from "mongoose";
import next from "next";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const development = process.env.NODE_ENV !== "production";

// Local-only values may override the shared file; deployed environment variables
// continue to take precedence because dotenv does not overwrite process.env.
dotenv.config({ path: path.join(webRoot, ".env.local"), quiet: true });
dotenv.config({ path: path.join(webRoot, ".env"), quiet: true });

const port = Number(process.env.PORT || 3000);
const hostname = process.env.BIND_HOST || "0.0.0.0";
const localOrigin = `http://localhost:${port}`;

const legacyLocalOrigin = (value) => /^http:\/\/(?:localhost|127\.0\.0\.1):5000\/?$/.test(value || "");
if (development && (!process.env.CLIENT_URL || legacyLocalOrigin(process.env.CLIENT_URL))) {
  // The former split app may still have port 5000 values in a developer's ignored
  // env files. Same-origin development deliberately normalizes those values.
  process.env.CLIENT_URL = localOrigin;
  if (!process.env.GOOGLE_CALLBACK_URL || legacyLocalOrigin(process.env.GOOGLE_CALLBACK_URL.replace(/\/api\/auth\/google\/callback$/, ""))) {
    process.env.GOOGLE_CALLBACK_URL = `${localOrigin}/api/auth/google/callback`;
  }
} else if (!process.env.CLIENT_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.CLIENT_URL = process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
}

const [{ default: connectDB }, { createApplication }] = await Promise.all([
  import("./src/server/config/db.js"),
  import("./src/server/index.js"),
]);

const nextApplication = next({ dev: development, dir: webRoot, hostname, port });
await nextApplication.prepare();

const application = createApplication({ nextHandler: nextApplication.getRequestHandler() });
const httpServer = createServer(application);
try {
  await connectDB();
} catch {
  await nextApplication.close().catch(() => undefined);
  process.exit(1);
}

httpServer.listen(port, hostname, () => {
  console.log(`Curevo is ready at ${development ? localOrigin : process.env.CLIENT_URL || `http://${hostname}:${port}`}`);
});

let closing = false;
const close = async (signal) => {
  if (closing) return;
  closing = true;
  console.log(`Received ${signal}; closing Curevo cleanly.`);
  const timeout = new Promise((resolve) => setTimeout(resolve, 10_000));
  if (httpServer.listening) {
    await Promise.race([
      new Promise((resolve) => httpServer.close(resolve)),
      timeout,
    ]);
  }
  await Promise.race([nextApplication.close(), timeout]);
  await Promise.race([mongoose.disconnect(), timeout]);
  process.exit(0);
};

process.on("SIGINT", () => void close("SIGINT"));
process.on("SIGTERM", () => void close("SIGTERM"));
