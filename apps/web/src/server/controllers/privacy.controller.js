import crypto from "crypto";

import AccountToken from "../models/accountToken.model.js";
import Consent from "../models/consent.model.js";
import Feedback from "../models/feedback.model.js";
import FocusSession from "../models/focusSession.model.js";
import Notification from "../models/notification.model.js";
import PrivacyRequest from "../models/privacyRequest.model.js";
import Reflection from "../models/reflection.model.js";
import Routine from "../models/routine.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import { writeAuditEvent } from "../utils/audit.js";
import { clearAuthCookie } from "../utils/session.js";

export const POLICY_VERSION = "2026-08-03";

const emailHash = (email) => crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

const recordRequest = (user, requestType) => PrivacyRequest.create({
  userId: user._id,
  emailHash: emailHash(user.email),
  requestType,
  policyVersion: POLICY_VERSION,
  isSynthetic: user.isSynthetic,
  seedBatch: user.seedBatch,
});

export const recordConsent = async (req, res) => {
  const { type, accepted, policyVersion } = req.body;
  if (type !== "terms-and-privacy" || typeof accepted !== "boolean") {
    return res.status(400).json({ success: false, error: "A supported consent type and accepted value are required" });
  }
  if (policyVersion !== POLICY_VERSION) {
    return res.status(409).json({ success: false, error: "The notice has changed. Review the current version before continuing." });
  }

  const consent = await Consent.create({
    userId: req.user.id,
    type,
    accepted,
    policyVersion,
    source: "settings",
    acceptedAt: accepted ? new Date() : undefined,
    revokedAt: accepted ? undefined : new Date(),
    isSynthetic: req.user.isSynthetic,
    seedBatch: req.user.seedBatch,
  });
  res.status(201).json({ success: true, data: consent });
};

export const exportAccount = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -providerId -profileImagePublicId").lean();
  if (!user) return res.status(404).json({ success: false, error: "Account not found" });

  const [sessions, routines, reflections, feedback, notifications, consents] = await Promise.all([
    FocusSession.find({ userId: user._id }).lean(),
    Routine.find({ userId: user._id }).lean(),
    Reflection.find({ userId: user._id }).lean(),
    Feedback.find({ userId: user._id }).select("-handledBy").lean(),
    Notification.find({ userId: user._id }).lean(),
    Consent.find({ userId: user._id }).lean(),
  ]);

  const audit = await recordRequest(user, "export");
  audit.status = "completed";
  audit.completedAt = new Date();
  await audit.save();

  res.set({
    "Cache-Control": "no-store",
    "Content-Disposition": `attachment; filename="curevo-export-${new Date().toISOString().slice(0, 10)}.json"`,
  });
  delete user.adminScope;
  res.json({
    exportedAt: new Date().toISOString(),
    policyVersion: POLICY_VERSION,
    account: { ...user, role: user.role === "admin" ? "admin" : "member" },
    focusSessions: sessions,
    routines,
    reflections,
    feedback,
    notifications,
    consents,
  });
};

export const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user.id).select("+password +profileImagePublicId");
  if (!user) return res.status(404).json({ success: false, error: "Account not found" });
  if (req.body.confirmEmail?.trim().toLowerCase() !== user.email) {
    return res.status(400).json({ success: false, error: "Enter the account email to confirm deletion" });
  }
  if (user.provider === "local" && !(await user.comparePassword(req.body.password || ""))) {
    return res.status(401).json({ success: false, error: "Current password is incorrect" });
  }

  const audit = await recordRequest(user, "deletion");
  await Promise.all([
    FocusSession.deleteMany({ userId: user._id }),
    Routine.deleteMany({ userId: user._id }),
    Reflection.deleteMany({ userId: user._id }),
    Feedback.deleteMany({ userId: user._id }),
    Notification.deleteMany({ userId: user._id }),
    Consent.deleteMany({ userId: user._id }),
    AccountToken.deleteMany({ userId: user._id }),
    Session.deleteMany({ userId: user._id }),
  ]);

  let externalCleanupPending = false;
  if (user.profileImagePublicId) {
    const cloudinary = (await import("../config/cloudinary.js")).default;
    const result = await Promise.allSettled([cloudinary.uploader.destroy(user.profileImagePublicId, { invalidate: true })]);
    externalCleanupPending = result.some((item) => item.status === "rejected");
  }

  await User.updateOne({ _id: user._id }, {
    $set: { name: "Deleted account", email: `deleted-${user._id}@anonymized.invalid`, status: "suspended", role: "member" },
    $unset: { phone: 1, address: 1, dateOfBirth: 1, gender: 1, bio: 1, profileImage: 1, profileImagePublicId: 1, providerId: 1, password: 1 },
  });

  audit.userId = undefined;
  audit.status = "completed";
  audit.completedAt = new Date();
  await audit.save();
  await writeAuditEvent(req, "account-deletion", "success", { targetUserId: user._id, metadata: { externalCleanupPending, mode: "personal-data-deleted" } });
  clearAuthCookie(res);
  res.json({ success: true, message: "Your account and personal focus data were deleted", mode: "personal-data-deleted", externalCleanupPending });
};
