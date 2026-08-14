import crypto from "node:crypto";
import AccountToken from "../models/accountToken.model.js";
import User from "../models/user.model.js";
import { consumeAccountToken, createAccountToken } from "../utils/accountToken.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/accountEmails.js";
import { writeAuditEvent } from "../utils/audit.js";
import { accountLink, sendAccountEmail } from "../utils/mail.js";
import { validatePasswordPolicy } from "../utils/passwordPolicy.js";
import { hashToken } from "../utils/security.js";
import { clearAuthCookie, revokeUserSessions } from "../utils/session.js";

const GENERIC_RECOVERY = "If the account can use password recovery, an email will be sent.";

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, provider: "local", status: "active" });
    let delivery = { delivered: false, reason: "not-applicable" };
    if (user) delivery = await sendPasswordResetEmail(user);
    await writeAuditEvent(req, "password-reset-request", "success", {
      targetUserId: user?._id,
      metadata: { delivery: delivery.delivered ? "sent" : delivery.reason },
    });
  } catch {
    // Keep recovery responses indistinguishable even when storage or mail is unavailable.
  }
  res.status(202).json({ success: true, message: GENERIC_RECOVERY });
};

export const resetPassword = async (req, res) => {
  const record = await consumeAccountToken(req.body.token, "password-reset");
  if (!record) {
    await writeAuditEvent(req, "password-reset", "failure", { metadata: { reason: "invalid-token" } });
    return res.status(400).json({ success: false, error: "This reset link is invalid or expired", requestId: req.id });
  }
  const user = await User.findById(record.userId).select("+password");
  if (!user || user.provider !== "local") return res.status(400).json({ success: false, error: "This reset link is invalid or expired", requestId: req.id });
  const passwordError = await validatePasswordPolicy(req.body.password, user);
  if (passwordError) {
    record.consumedAt = undefined;
    await record.save();
    return res.status(400).json({ success: false, error: passwordError, requestId: req.id });
  }
  user.password = req.body.password;
  await user.save();
  await revokeUserSessions(user._id, "password-reset");
  clearAuthCookie(res);
  await writeAuditEvent(req, "password-reset", "success", { targetUserId: user._id });
  res.status(200).json({ success: true, message: "Password reset complete. Sign in again on every device." });
};

export const verifyEmail = async (req, res) => {
  const record = await consumeAccountToken(req.body.token, "email-verify");
  if (!record) return res.status(400).json({ success: false, error: "This verification link is invalid or expired", requestId: req.id });
  const user = await User.findByIdAndUpdate(record.userId, { emailVerifiedAt: new Date() }, { new: true });
  await writeAuditEvent(req, "email-verification", "success", { targetUserId: user?._id });
  res.status(200).json({ success: true, message: "Email verified" });
};

export const resendVerification = async (req, res) => {
  let delivery = { delivered: false, reason: "already-verified" };
  if (!req.user.emailVerifiedAt) delivery = await sendVerificationEmail(req.user);
  await writeAuditEvent(req, "email-verification-resend", "success", {
    metadata: { delivery: delivery.delivered ? "sent" : delivery.reason },
  });
  res.status(202).json({ success: true, message: "If verification is still required, an email will be sent." });
};

export const requestEmailChange = async (req, res) => {
  const newEmail = String(req.body.newEmail).trim().toLowerCase();
  const user = await User.findById(req.user._id).select("+password");
  if (user.provider === "local" && !await user.comparePassword(req.body.currentPassword)) {
    await writeAuditEvent(req, "email-change", "failure", { metadata: { reason: "reauthentication-failed" } });
    return res.status(401).json({ success: false, error: "Current password is incorrect", requestId: req.id });
  }
  if (newEmail === user.email || await User.exists({ email: newEmail })) {
    return res.status(400).json({ success: false, error: "Email change cannot be completed", requestId: req.id });
  }

  const requestId = crypto.randomUUID();
  const metadata = { requestId, newEmail };
  const oldToken = await createAccountToken({ userId: user._id, type: "email-change-old", ttlMinutes: 30, metadata });
  const newToken = await createAccountToken({ userId: user._id, type: "email-change-new", ttlMinutes: 30, metadata });
  user.pendingEmailChange = { requestId, newEmail, expiresAt: new Date(Date.now() + 30 * 60 * 1000) };
  await user.save();

  await Promise.all([
    sendAccountEmail({
      to: user.email,
      subject: "Approve your Curevo email change",
      text: `Approve this change within 30 minutes: ${accountLink("/confirm-email-change", oldToken.rawToken)}`,
    }),
    sendAccountEmail({
      to: newEmail,
      subject: "Confirm your new Curevo email",
      text: `Confirm this address within 30 minutes: ${accountLink("/confirm-email-change", newToken.rawToken)}`,
    }),
  ]);
  await writeAuditEvent(req, "email-change", "success", { metadata: { stage: "requested" } });
  res.status(202).json({ success: true, message: "Confirmation is required from both email addresses." });
};

export const confirmEmailChange = async (req, res) => {
  const record = await AccountToken.findOne({
    tokenHash: hashToken(req.body.token),
    type: { $in: ["email-change-old", "email-change-new"] },
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!record) return res.status(400).json({ success: false, error: "This confirmation link is invalid or expired", requestId: req.id });
  const user = await User.findById(record.userId);
  if (!user?.pendingEmailChange || user.pendingEmailChange.requestId !== record.metadata.requestId
    || user.pendingEmailChange.expiresAt < new Date()) {
    return res.status(400).json({ success: false, error: "This confirmation link is invalid or expired", requestId: req.id });
  }
  record.consumedAt = new Date();
  await record.save();
  if (record.type === "email-change-old") user.pendingEmailChange.oldConfirmedAt = new Date();
  else user.pendingEmailChange.newConfirmedAt = new Date();

  const completed = user.pendingEmailChange.oldConfirmedAt && user.pendingEmailChange.newConfirmedAt;
  if (completed) {
    user.email = user.pendingEmailChange.newEmail;
    user.emailVerifiedAt = new Date();
    user.pendingEmailChange = undefined;
    await user.save();
    await revokeUserSessions(user._id, "email-change");
    await writeAuditEvent(req, "email-change", "success", { targetUserId: user._id, metadata: { stage: "completed" } });
  } else {
    await user.save();
  }
  res.status(200).json({ success: true, data: { completed: Boolean(completed) } });
};
