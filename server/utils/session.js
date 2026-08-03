import Session from "../models/session.model.js";
import { hashIp, hashToken, randomToken, requestIp } from "./security.js";

export const SESSION_COOKIE = "curevo_session";
export const MFA_COOKIE = "curevo_mfa";

const sameSite = () => process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === "production" ? "none" : "lax");
const secure = () => process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

export const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: secure(),
  sameSite: sameSite(),
  path: "/",
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  ...(maxAge ? { maxAge } : {}),
});

export const clearAuthCookie = (res, name = SESSION_COOKIE) => {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(name, options);
};

export const createSession = async ({ user, req, res, remember = false, mfaVerified = false, enrollmentRequired = false }) => {
  const rawToken = randomToken();
  const durationMs = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const session = await Session.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + durationMs),
    ipHash: hashIp(requestIp(req)),
    userAgent: String(req.get("user-agent") || "unknown").slice(0, 300),
    remember,
    mfaVerifiedAt: mfaVerified ? new Date() : undefined,
    mfaEnrollmentRequired: enrollmentRequired,
  });
  res.cookie(SESSION_COOKIE, rawToken, cookieOptions(durationMs));
  return session;
};

export const findSession = async (rawToken) => {
  if (!rawToken) return null;
  return Session.findOne({
    tokenHash: hashToken(rawToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

export const revokeSessionToken = async (rawToken, reason = "logout") => {
  if (!rawToken) return null;
  return Session.findOneAndUpdate(
    { tokenHash: hashToken(rawToken), revokedAt: null },
    { revokedAt: new Date(), revokedReason: reason },
    { new: true },
  );
};

export const revokeUserSessions = (userId, reason, exceptId) => Session.updateMany({
  userId,
  revokedAt: null,
  ...(exceptId ? { _id: { $ne: exceptId } } : {}),
}, { revokedAt: new Date(), revokedReason: reason });
