import { hashToken, randomToken, safeEqual } from "./security.js";

const MAX_GRANT_TTL_SECONDS = 10 * 60;

export const createRoomGrant = ({ appointmentId, roomId, userId, role, grantVersion = 0, ttlSeconds = 5 * 60 }) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    appointmentId: String(appointmentId),
    roomId: String(roomId),
    userId: String(userId),
    role,
    grantVersion,
    nonce: randomToken(12),
    issuedAt: now,
    expiresAt: now + Math.min(Math.max(ttlSeconds, 30), MAX_GRANT_TTL_SECONDS),
  })).toString("base64url");
  return `${payload}.${hashToken(`telehealth-grant:${payload}`)}`;
};

export const verifyRoomGrant = (grant) => {
  if (typeof grant !== "string" || grant.length > 900) return null;
  const [payload, signature] = grant.split(".");
  if (!payload || !signature || !safeEqual(signature, hashToken(`telehealth-grant:${payload}`))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!value.appointmentId || !value.roomId || !value.userId || !value.role || !value.nonce
      || !Number.isInteger(value.expiresAt) || value.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return value;
  } catch {
    return null;
  }
};
