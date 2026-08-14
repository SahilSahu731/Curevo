import AccountToken from "../models/accountToken.model.js";
import { hashToken, randomToken } from "./security.js";

export const createAccountToken = async ({ userId, type, ttlMinutes, metadata = {} }) => {
  await AccountToken.updateMany({ userId, type, consumedAt: null }, { consumedAt: new Date() });
  const rawToken = randomToken();
  const record = await AccountToken.create({
    userId,
    type,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    metadata,
  });
  return { rawToken, record };
};

export const consumeAccountToken = async (rawToken, type) => {
  if (!rawToken) return null;
  return AccountToken.findOneAndUpdate({
    tokenHash: hashToken(rawToken),
    type,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }, { consumedAt: new Date() }, { new: true });
};
