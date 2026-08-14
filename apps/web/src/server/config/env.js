import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(webRoot, ".env.local"), quiet: true });
dotenv.config({ path: path.join(webRoot, ".env"), quiet: true });

export const validateProductionEnvironment = () => {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters in production");
  if (!String(process.env.CLIENT_URL || "").startsWith("https://")) throw new Error("CLIENT_URL must use HTTPS in production");
  if ((process.env.COOKIE_SAME_SITE || "lax") !== "lax") {
    throw new Error("COOKIE_SAME_SITE=lax is required for same-origin sessions and Google OAuth callbacks");
  }
};
