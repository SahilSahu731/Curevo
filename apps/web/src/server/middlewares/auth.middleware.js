import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import { findSession, SESSION_COOKIE } from "../utils/session.js";

const MFA_ENROLLMENT_PATHS = new Set([
  "/api/auth/me",
  "/api/auth/logout",
  "/api/auth/mfa/setup",
  "/api/auth/mfa/confirm",
]);

export const protect = async (req, res, next) => {
  try {
    const rawToken = req.cookies[SESSION_COOKIE];
    const session = await findSession(rawToken);
    if (!session) {
      return res.status(401).json({ success: false, error: "Authentication required", requestId: req.id });
    }

    const user = await User.findById(session.userId).select("-password");
    if (!user || user.status !== "active") {
      await Session.updateOne({ _id: session._id }, { revokedAt: new Date(), revokedReason: "account-unavailable" });
      return res.status(401).json({ success: false, error: "Authentication required", requestId: req.id });
    }

    if (session.mfaEnrollmentRequired && !MFA_ENROLLMENT_PATHS.has(req.originalUrl.split("?")[0])) {
      return res.status(403).json({ success: false, error: "Administrator MFA enrollment is required", code: "MFA_SETUP_REQUIRED", requestId: req.id });
    }

    req.user = user;
    req.authSession = session;
    if (!session.lastSeenAt || Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
      Session.updateOne({ _id: session._id }, { lastSeenAt: new Date() }).catch(() => {});
    }
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Authentication required", requestId: req.id });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required", requestId: req.id });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: "You do not have access to this resource", requestId: req.id });
  }
  next();
};

export const authorizeAdminScope = (...scopes) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required", requestId: req.id });
  if (req.user.role !== "admin" || !scopes.includes(req.user.adminScope || "operations")) {
    return res.status(403).json({ success: false, error: "Your administrator scope does not permit this action", requestId: req.id });
  }
  next();
};

export const requireClinicalAdminScope = (req, res, next) => {
  if (req.user?.role !== "admin") return next();
  return authorizeAdminScope("compliance", "super-admin")(req, res, next);
};

export const requireVerifiedEmail = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  if (!req.user?.emailVerifiedAt) {
    return res.status(403).json({
      success: false,
      error: "Verify your email before using this workflow",
      code: "EMAIL_VERIFICATION_REQUIRED",
      requestId: req.id,
    });
  }
  next();
};

export const requireRecentMfa = (req, res, next) => {
  const verifiedAt = req.authSession?.mfaVerifiedAt ? new Date(req.authSession.mfaVerifiedAt).getTime() : 0;
  if (!verifiedAt || Date.now() - verifiedAt > 15 * 60_000) {
    return res.status(403).json({ success: false, error: "Recent MFA verification is required", code: "MFA_REAUTH_REQUIRED", requestId: req.id });
  }
  next();
};
