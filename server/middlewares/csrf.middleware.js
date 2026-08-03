import { cookieOptions } from "../utils/session.js";
import { hashToken, randomToken, safeEqual } from "../utils/security.js";

export const CSRF_COOKIE = "curevo_csrf";

const allowedOrigins = () => new Set(
  [process.env.CLIENT_URL, ...(process.env.ADDITIONAL_CLIENT_ORIGINS || "").split(",")]
    .filter(Boolean)
    .map((value) => value.trim().replace(/\/$/, "")),
);

const signedValue = (token) => `${token}.${hashToken(`csrf:${token}`)}`;

export const issueCsrfToken = (req, res) => {
  const token = randomToken(24);
  res.cookie(CSRF_COOKIE, signedValue(token), { ...cookieOptions(2 * 60 * 60 * 1000), httpOnly: true });
  res.status(200).json({ success: true, csrfToken: token });
};

export const validateCsrf = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const origin = req.get("origin");
  const referer = req.get("referer");
  const allowed = allowedOrigins();
  let source = origin || null;
  if (!source && referer) {
    try {
      source = new URL(referer).origin;
    } catch {
      return res.status(403).json({ success: false, error: "Request origin rejected", requestId: req.id });
    }
  }
  const originRequired = process.env.NODE_ENV === "production" && process.env.ALLOW_NON_BROWSER_CLIENTS !== "true";
  if ((source && !allowed.has(source)) || (!source && originRequired)) {
    return res.status(403).json({ success: false, error: "Request origin rejected", requestId: req.id });
  }

  const headerToken = req.get("x-csrf-token");
  const [cookieToken, signature] = String(req.cookies[CSRF_COOKIE] || "").split(".");
  if (!headerToken || !cookieToken || !signature || !safeEqual(headerToken, cookieToken)
    || !safeEqual(signature, hashToken(`csrf:${cookieToken}`))) {
    return res.status(403).json({ success: false, error: "CSRF validation failed", requestId: req.id });
  }
  next();
};
