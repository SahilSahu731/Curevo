import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const validateProductionEnvironment = () => {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters in production");
  if (!String(process.env.CLIENT_URL || "").startsWith("https://")) throw new Error("CLIENT_URL must use HTTPS in production");
  if (process.env.COOKIE_SAME_SITE !== "none") throw new Error("COOKIE_SAME_SITE=none is required for the production client/API deployment");
};
