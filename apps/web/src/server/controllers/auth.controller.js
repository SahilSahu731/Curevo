import Consent from "../models/consent.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import { POLICY_VERSION } from "./privacy.controller.js";
import { clearLoginFailures, recordLoginFailure } from "../middlewares/authRateLimit.middleware.js";
import { createAccountToken } from "../utils/accountToken.js";
import { sendVerificationEmail } from "../utils/accountEmails.js";
import { writeAuditEvent } from "../utils/audit.js";
import { validatePasswordPolicy } from "../utils/passwordPolicy.js";
import {
  clearAuthCookie,
  cookieOptions,
  createSession,
  MFA_COOKIE,
  revokeSessionToken,
  revokeUserSessions,
  SESSION_COOKIE,
} from "../utils/session.js";

export const safeUser = (user) => {
  const value = user.toObject ? user.toObject() : { ...user };
  value.role = value.role === "admin" ? "admin" : "member";
  delete value.adminScope;
  delete value.password;
  delete value.providerId;
  delete value.profileImagePublicId;
  if (value.mfa) value.mfa = { enabled: Boolean(value.mfa.enabled), enabledAt: value.mfa.enabledAt };
  return value;
};

const authResponse = (res, status, user, extra = {}) => res.status(status).json({
  success: true,
  data: { user: safeUser(user), ...extra },
});

export const register = async (req, res) => {
  const { name, email, password, acceptedTerms, policyVersion, remember = false } = req.body;
  try {
    if (!acceptedTerms || policyVersion !== POLICY_VERSION) {
      return res.status(400).json({ success: false, error: "Review and accept the current Terms and Privacy Notice", requestId: req.id });
    }
    const passwordError = await validatePasswordPolicy(password, { name, email });
    if (passwordError) return res.status(400).json({ success: false, error: passwordError, requestId: req.id });
    if (await User.exists({ email })) {
      await writeAuditEvent(req, "registration", "blocked", { metadata: { reason: "duplicate" } });
      return res.status(400).json({ success: false, error: "Unable to create an account with these details", requestId: req.id });
    }

    const user = await User.create({ name, email, password, role: "member", provider: "local" });
    try {
      await Consent.create({
        userId: user._id,
        type: "terms-and-privacy",
        policyVersion: POLICY_VERSION,
        accepted: true,
        acceptedAt: new Date(),
        source: "email-registration",
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }

    const delivery = await sendVerificationEmail(user);
    const enrollmentRequired = process.env.NODE_ENV === "production" && user.role === "admin" && !user.mfa?.enabled;
    await createSession({ user, req, res, remember, enrollmentRequired });
    await writeAuditEvent(req, "registration", "success", {
      actorUserId: user._id,
      targetUserId: user._id,
      metadata: { verificationDelivery: delivery.delivered ? "sent" : delivery.reason },
    });
    return authResponse(res, 201, user, { emailVerificationRequired: true, enrollmentRequired });
  } catch (error) {
    await writeAuditEvent(req, "registration", "failure", { metadata: { reason: error.name || "error" } });
    const validation = error.name === "ValidationError";
    return res.status(validation ? 400 : 500).json({
      success: false,
      error: validation ? "Unable to create an account with these details" : "Account creation failed",
      requestId: req.id,
    });
  }
};

export const login = async (req, res) => {
  const { email, password, remember = false } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    const valid = user && user.provider === "local" && await user.comparePassword(password);
    if (!valid || user.status !== "active") {
      recordLoginFailure(req.loginRateKey);
      await writeAuditEvent(req, "login", "failure", { targetUserId: user?._id, metadata: { reason: "invalid-credentials" } });
      return res.status(401).json({ success: false, error: "Invalid email or password", requestId: req.id });
    }
    clearLoginFailures(req.loginRateKey);

    if (user.mfa?.enabled) {
      const { rawToken } = await createAccountToken({
        userId: user._id,
        type: "mfa-login",
        ttlMinutes: 5,
        metadata: { remember: Boolean(remember) },
      });
      res.cookie(MFA_COOKIE, rawToken, cookieOptions(5 * 60 * 1000));
      await writeAuditEvent(req, "login", "success", { actorUserId: user._id, metadata: { stage: "password", mfaRequired: true } });
      return res.status(200).json({ success: true, data: { mfaRequired: true } });
    }

    const enrollmentRequired = process.env.NODE_ENV === "production" && user.role === "admin";
    await createSession({ user, req, res, remember, enrollmentRequired });
    await writeAuditEvent(req, "login", "success", { actorUserId: user._id, metadata: { mfaRequired: false } });
    return authResponse(res, 200, user, { mfaEnrollmentRequired: enrollmentRequired });
  } catch {
    recordLoginFailure(req.loginRateKey);
    return res.status(500).json({ success: false, error: "Sign-in failed", requestId: req.id });
  }
};

export const logout = async (req, res) => {
  await revokeSessionToken(req.cookies[SESSION_COOKIE], "logout");
  clearAuthCookie(res);
  clearAuthCookie(res, MFA_COOKIE);
  await writeAuditEvent(req, "session-revocation", "success", { metadata: { scope: "current" } });
  res.status(200).json({ success: true, data: {} });
};

export const logoutAll = async (req, res) => {
  await revokeUserSessions(req.user._id, "logout-all");
  clearAuthCookie(res);
  clearAuthCookie(res, MFA_COOKIE);
  await writeAuditEvent(req, "session-revocation", "success", { metadata: { scope: "all" } });
  res.status(200).json({ success: true, data: {} });
};

export const getMe = (req, res) => authResponse(res, 200, req.user, {
  session: {
    id: req.authSession._id,
    expiresAt: req.authSession.expiresAt,
    mfaEnrollmentRequired: req.authSession.mfaEnrollmentRequired,
  },
});

export const listSessions = async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id, revokedAt: null, expiresAt: { $gt: new Date() } })
    .select("createdAt lastSeenAt expiresAt userAgent remember mfaVerifiedAt")
    .sort({ lastSeenAt: -1 })
    .lean();
  res.status(200).json({
    success: true,
    data: sessions.map((session) => ({ ...session, current: session._id.toString() === req.authSession._id.toString() })),
  });
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!await user.comparePassword(currentPassword)) {
      await writeAuditEvent(req, "password-change", "failure", { metadata: { reason: "invalid-current-password" } });
      return res.status(401).json({ success: false, error: "Current password is incorrect", requestId: req.id });
    }
    const passwordError = await validatePasswordPolicy(newPassword, user);
    if (passwordError) return res.status(400).json({ success: false, error: passwordError, requestId: req.id });
    user.password = newPassword;
    await user.save();
    await revokeUserSessions(user._id, "password-change");
    await createSession({ user, req, res, remember: false, mfaVerified: Boolean(user.mfa?.enabled) });
    await writeAuditEvent(req, "password-change", "success");
    return authResponse(res, 200, user);
  } catch {
    return res.status(500).json({ success: false, error: "Password change failed", requestId: req.id });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const allowed = ["name", "phone", "address", "gender", "dateOfBirth", "bio"];
    const updates = Object.fromEntries(allowed.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return authResponse(res, 200, user);
  } catch {
    return res.status(400).json({ success: false, error: "Profile update failed", requestId: req.id });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No image file provided", requestId: req.id });
    const dataURI = `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString("base64")}`;
    const cloudinary = (await import("../config/cloudinary.js")).default;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "curevo/profiles",
      resource_type: "image",
      transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }],
    });
    const current = await User.findById(req.user._id).select("+profileImagePublicId");
    if (current?.profileImagePublicId) await cloudinary.uploader.destroy(current.profileImagePublicId, { invalidate: true });
    const user = await User.findByIdAndUpdate(req.user._id, {
      profileImage: result.secure_url,
      profileImagePublicId: result.public_id,
    }, { new: true });
    return authResponse(res, 200, user);
  } catch {
    return res.status(500).json({ success: false, error: "Image upload failed", requestId: req.id });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    await Consent.create({
      userId: user._id,
      type: "terms-and-privacy",
      policyVersion: POLICY_VERSION,
      accepted: true,
      acceptedAt: new Date(),
      source: "google-oauth",
    });
    const enrollmentRequired = process.env.NODE_ENV === "production" && user.role === "admin" && !user.mfa?.enabled;
    await createSession({ user, req, res, remember: true, enrollmentRequired });
    await writeAuditEvent(req, "login", "success", { actorUserId: user._id, metadata: { provider: "google" } });
    const target = encodeURIComponent(req.oauthReturn || "");
    res.redirect(`${process.env.CLIENT_URL}/auth/callback${target ? `?redirect=${target}` : ""}`);
  } catch {
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }
};
