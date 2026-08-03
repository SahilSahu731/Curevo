import crypto from "crypto";
import Appointment from "../models/appointment.model.js";
import ClinicReview from "../models/clinicReview.model.js";
import Consent from "../models/consent.model.js";
import Doctor from "../models/doctor.model.js";
import Feedback from "../models/feedback.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import Notification from "../models/notification.model.js";
import SlotReservation from "../models/slotReservation.model.js";
import PrivacyRequest from "../models/privacyRequest.model.js";
import Queue from "../models/queue.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import AccountToken from "../models/accountToken.model.js";
import Session from "../models/session.model.js";
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
  if (!["terms-and-privacy", "telehealth"].includes(type) || typeof accepted !== "boolean") {
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
    source: type === "telehealth" ? "telehealth-prejoin" : "settings",
    acceptedAt: accepted ? new Date() : undefined,
    revokedAt: accepted ? undefined : new Date(),
    isSynthetic: req.user.isSynthetic,
    seedBatch: req.user.seedBatch,
  });

  res.status(201).json({ success: true, data: consent });
};

export const exportAccount = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -providerId").lean();
  if (!user) return res.status(404).json({ success: false, error: "Account not found" });

  const doctor = await Doctor.findOne({ userId: user._id }).lean();
  const doctorId = doctor?._id;
  const safeDoctor = doctor ? {
    ...doctor,
    verification: doctor.verification ? { status: doctor.verification.status, submittedAt: doctor.verification.submittedAt, reviewedAt: doctor.verification.reviewedAt } : undefined,
  } : null;
  const [appointments, medicalRecords, reviews, clinicReviews, feedback, notifications, consents] = await Promise.all([
    Appointment.find({ $or: [{ patientId: user._id }, ...(doctorId ? [{ doctorId }] : [])] }).setOptions({ sanitizeFilter: false }).lean(),
    MedicalRecord.find({ $or: [{ patientId: user._id }, ...(doctorId ? [{ doctorId }] : [])] }).setOptions({ sanitizeFilter: false })
      .select("-doctorNotes -attachments.url -attachments.storageKey")
      .lean(),
    Review.find({ $or: [{ patientId: user._id }, ...(doctorId ? [{ doctorId }] : [])] }).setOptions({ sanitizeFilter: false }).lean(),
    ClinicReview.find({ patientId: user._id }).lean(),
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
  res.json({
    exportedAt: new Date().toISOString(),
    policyVersion: POLICY_VERSION,
    account: user,
    doctorProfile: safeDoctor,
    appointments,
    medicalRecords,
    reviews,
    clinicReviews,
    feedback,
    notifications,
    consents,
  });
};

export const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user.id).select('+password +profileImagePublicId');
  if (!user) return res.status(404).json({ success: false, error: "Account not found" });
  if (req.body.confirmEmail?.trim().toLowerCase() !== user.email) {
    return res.status(400).json({ success: false, error: "Enter the account email to confirm deletion" });
  }
  if (user.provider === "local" && !(await user.comparePassword(req.body.password || ""))) {
    return res.status(401).json({ success: false, error: "Current password is incorrect" });
  }

  const audit = await recordRequest(user, "deletion");
  const doctor = await Doctor.findOne({ userId: user._id }).select('+verification.licenseFilePublicId +verification.licenseFileResourceType');
  const relatedAppointments = await Appointment.find({
    $or: [{ patientId: user._id }, ...(doctor ? [{ doctorId: doctor._id }] : [])],
  }).setOptions({ sanitizeFilter: false }).select("_id").lean();
  const appointmentIds = relatedAppointments.map(({ _id }) => _id);

  // Medical and audit records are retained for the applicable legal/clinical retention period.
  // The account is anonymized and deactivated instead of deleting the clinical graph.
  await Promise.all([
    Queue.updateMany({}, { $pull: { appointmentIds: { $in: appointmentIds }, emergencyQueue: { $in: appointmentIds } } }),
    Review.updateMany({ patientId: user._id }, { $set: { comment: "[Account anonymized]" } }),
    ClinicReview.updateMany({ patientId: user._id }, { $set: { comment: "[Account anonymized]" } }),
    Feedback.updateMany({ userId: user._id }, { $set: { message: "[Account anonymized]" } }),
    Notification.deleteMany({ userId: user._id }),
    SlotReservation.deleteMany({ $or: [{ patientId: user._id }, { appointmentId: { $in: appointmentIds } }] }).setOptions({ sanitizeFilter: false }),
    Consent.deleteMany({ userId: user._id }),
    AccountToken.deleteMany({ userId: user._id }),
    Session.deleteMany({ userId: user._id }),
  ]);
  const cloudinary = (await import('../config/cloudinary.js')).default;
  const objectDeletions = [];
  if (user.profileImagePublicId) objectDeletions.push(cloudinary.uploader.destroy(user.profileImagePublicId, { invalidate: true }));
  if (doctor?.verification?.licenseFilePublicId) {
    objectDeletions.push(cloudinary.uploader.destroy(doctor.verification.licenseFilePublicId, {
      resource_type: doctor.verification.licenseFileResourceType || 'image',
      type: 'authenticated',
      invalidate: true,
    }));
  }
  const objectResults = await Promise.allSettled(objectDeletions);
  const externalCleanupPending = objectResults.some((result) => result.status === 'rejected');
  if (doctor) {
    doctor.isAvailable = false;
    if (doctor.verification) doctor.verification.licenseFileUrl = undefined;
    await doctor.save();
  }
  await User.updateOne({ _id: user._id }, {
    $set: { name: "Anonymized account", email: `deleted-${user._id}@anonymized.invalid`, status: "suspended" },
    $unset: { phone: 1, address: 1, dateOfBirth: 1, profileImage: 1, profileImagePublicId: 1, providerId: 1, password: 1 },
  });

  audit.userId = undefined;
  audit.status = "completed";
  audit.completedAt = new Date();
  await audit.save();

  await writeAuditEvent(req, "account-deletion", "success", { targetUserId: user._id, metadata: { externalCleanupPending, mode: "anonymized-retained-records" } });
  const { disconnectUserSessions } = await import("../config/socket.js");
  disconnectUserSessions(user._id.toString());
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: "Account deactivated and personal data anonymized; records retained where required",
    mode: "anonymized-retained-records",
    externalCleanupPending,
  });
};
