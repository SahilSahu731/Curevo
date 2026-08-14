import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verify } from "otplib";
import AccountToken from "../models/accountToken.model.js";
import User from "../models/user.model.js";
import { safeUser } from "./auth.controller.js";
import { writeAuditEvent } from "../utils/audit.js";
import { decryptSecret, encryptSecret, hashToken, randomToken } from "../utils/security.js";
import {
  clearAuthCookie,
  createSession,
  MFA_COOKIE,
  revokeUserSessions,
} from "../utils/session.js";

const mfaUser = (id) => User.findById(id).select("+password +mfa.secretEncrypted +mfa.pendingSecretEncrypted +mfa.recoveryCodeHashes");

const verifyTotp = async (secret, token) => (await verify({ secret, token, epochTolerance: 30 })).valid;

export const beginMfaSetup = async (req, res) => {
  const user = await mfaUser(req.user._id);
  const secret = generateSecret();
  user.mfa.pendingSecretEncrypted = encryptSecret(secret);
  user.mfa.pendingExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  res.status(200).json({
    success: true,
    data: {
      secret,
      uri: generateURI({ issuer: "Curevo", label: user.email, secret }),
      expiresAt: user.mfa.pendingExpiresAt,
    },
  });
};

export const confirmMfaSetup = async (req, res) => {
  const user = await mfaUser(req.user._id);
  if (!user.mfa?.pendingSecretEncrypted || !user.mfa.pendingExpiresAt || user.mfa.pendingExpiresAt < new Date()) {
    return res.status(400).json({ success: false, error: "MFA setup has expired", requestId: req.id });
  }
  const secret = decryptSecret(user.mfa.pendingSecretEncrypted);
  if (!await verifyTotp(secret, req.body.code)) {
    await writeAuditEvent(req, "mfa-enrollment", "failure");
    return res.status(400).json({ success: false, error: "Invalid authentication code", requestId: req.id });
  }
  const recoveryCodes = Array.from({ length: 10 }, () => randomToken(8).toUpperCase());
  user.mfa.enabled = true;
  user.mfa.secretEncrypted = encryptSecret(secret);
  user.mfa.pendingSecretEncrypted = undefined;
  user.mfa.pendingExpiresAt = undefined;
  user.mfa.recoveryCodeHashes = await Promise.all(recoveryCodes.map((code) => bcrypt.hash(code, 12)));
  user.mfa.enabledAt = new Date();
  await user.save();
  await revokeUserSessions(user._id, "mfa-enrollment");
  await createSession({ user, req, res, mfaVerified: true });
  await writeAuditEvent(req, "mfa-enrollment", "success");
  res.status(200).json({ success: true, data: { user: safeUser(user), recoveryCodes } });
};

export const verifyMfaLogin = async (req, res) => {
  const rawChallenge = req.cookies[MFA_COOKIE];
  const challenge = rawChallenge && await AccountToken.findOne({
    tokenHash: hashToken(rawChallenge),
    type: "mfa-login",
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!challenge || challenge.attempts >= 5) {
    clearAuthCookie(res, MFA_COOKIE);
    return res.status(401).json({ success: false, error: "MFA challenge is invalid or expired", requestId: req.id });
  }
  const user = await mfaUser(challenge.userId);
  let valid = false;
  let recoveryIndex = -1;
  if (req.body.recoveryCode) {
    for (let index = 0; index < (user.mfa.recoveryCodeHashes || []).length; index += 1) {
      if (await bcrypt.compare(req.body.recoveryCode, user.mfa.recoveryCodeHashes[index])) {
        recoveryIndex = index;
        valid = true;
        break;
      }
    }
  } else if (user.mfa?.secretEncrypted) {
    valid = await verifyTotp(decryptSecret(user.mfa.secretEncrypted), req.body.code);
  }
  if (!valid) {
    challenge.attempts += 1;
    await challenge.save();
    await writeAuditEvent(req, "mfa-login", "failure", { targetUserId: user._id });
    return res.status(401).json({ success: false, error: "Invalid authentication code", requestId: req.id });
  }
  if (recoveryIndex >= 0) {
    user.mfa.recoveryCodeHashes.splice(recoveryIndex, 1);
    await user.save();
  }
  challenge.consumedAt = new Date();
  await challenge.save();
  clearAuthCookie(res, MFA_COOKIE);
  await createSession({ user, req, res, remember: Boolean(challenge.metadata?.remember), mfaVerified: true });
  await writeAuditEvent(req, "mfa-login", "success", { actorUserId: user._id, metadata: { recoveryCode: recoveryIndex >= 0 } });
  res.status(200).json({ success: true, data: { user: safeUser(user) } });
};

export const disableMfa = async (req, res) => {
  const user = await mfaUser(req.user._id);
  if (process.env.NODE_ENV === "production" && user.role === "admin") {
    return res.status(403).json({ success: false, error: "Administrator MFA cannot be disabled in production", requestId: req.id });
  }
  if (user.provider === "local" && !await user.comparePassword(req.body.currentPassword)) {
    return res.status(401).json({ success: false, error: "Current password is incorrect", requestId: req.id });
  }
  if (!user.mfa?.secretEncrypted || !await verifyTotp(decryptSecret(user.mfa.secretEncrypted), req.body.code)) {
    return res.status(400).json({ success: false, error: "Invalid authentication code", requestId: req.id });
  }
  user.mfa = { enabled: false };
  await user.save();
  await revokeUserSessions(user._id, "mfa-disabled");
  await createSession({ user, req, res });
  await writeAuditEvent(req, "mfa-disabled", "success");
  res.status(200).json({ success: true, data: { user: safeUser(user) } });
};
