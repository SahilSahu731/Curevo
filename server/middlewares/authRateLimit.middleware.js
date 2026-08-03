import rateLimit from "express-rate-limit";
import { hashToken } from "../utils/security.js";

const buildLimiter = (windowMs, limit) => rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
});

export const loginIpLimiter = buildLimiter(15 * 60 * 1000, 20);
export const registrationLimiter = buildLimiter(60 * 60 * 1000, 10);
export const recoveryLimiter = buildLimiter(60 * 60 * 1000, 8);
export const resendLimiter = buildLimiter(60 * 60 * 1000, 5);
export const oauthLimiter = buildLimiter(15 * 60 * 1000, 30);
export const passwordChangeLimiter = buildLimiter(60 * 60 * 1000, 8);

const failures = new Map();
const FAILURE_WINDOW_MS = 15 * 60 * 1000;

const keyFor = (email) => hashToken(`login:${String(email || "").trim().toLowerCase()}`);

export const accountLoginDelay = async (req, res, next) => {
  const key = keyFor(req.body?.email);
  const entry = failures.get(key);
  if (entry && Date.now() - entry.startedAt < FAILURE_WINDOW_MS) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(entry.count * 250, 2000)));
  }
  req.loginRateKey = key;
  next();
};

export const recordLoginFailure = (key) => {
  const current = failures.get(key);
  failures.set(key, !current || Date.now() - current.startedAt >= FAILURE_WINDOW_MS
    ? { count: 1, startedAt: Date.now() }
    : { ...current, count: current.count + 1 });
};

export const clearLoginFailures = (key) => failures.delete(key);
