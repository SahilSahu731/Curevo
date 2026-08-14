import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import ClinicalNote from "../models/clinicalNote.model.js";
import Doctor from "../models/doctor.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import MedicalRecordRevision from "../models/medicalRecordRevision.model.js";
import { writeAuditEvent } from "../utils/audit.js";

const publicProjection = "-doctorNotes -__v";
const populateRecord = (query) => query
  .select(publicProjection)
  .populate("patientId", "name email phone profileImage gender dateOfBirth")
  .populate({ path: "doctorId", populate: { path: "userId", select: "name email profileImage" } })
  .populate({ path: "appointmentId", select: "date slotTime tokenNumber consultationType clinicId", populate: { path: "clinicId", select: "name address city phone" } });

const getDoctorForUser = (userId) => Doctor.findOne({ userId });
const idOf = (value) => value?._id?.toString?.() || value?.toString?.();

const breakGlassReason = (req) => String(req.get("x-break-glass-reason") || req.body?.breakGlassReason || req.query?.breakGlassReason || "").trim();

const authorizeScope = async (req, record, { allowAdmin = false } = {}) => {
  if (req.user.role === "patient") return idOf(record.patientId) === req.user.id;
  if (req.user.role === "doctor") {
    const doctor = await getDoctorForUser(req.user.id);
    return Boolean(doctor && idOf(record.doctorId) === doctor._id.toString() && idOf(record.authorDoctorId || record.doctorId) === doctor._id.toString());
  }
  if (req.user.role === "admin" && allowAdmin && breakGlassReason(req).length >= 10) {
    await writeAuditEvent(req, "medical-record-break-glass", "success", { metadata: { reasonLength: breakGlassReason(req).length } });
    return true;
  }
  return false;
};

const ensureAppointmentScope = async (req, appointmentId) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) return null;
  const appointment = await Appointment.findById(appointmentId).select("patientId doctorId status symptoms").lean();
  if (!appointment) return null;
  if (req.user.role !== "doctor") return null;
  const doctor = await getDoctorForUser(req.user.id);
  if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) return null;
  return { appointment, doctor };
};

const parsePrescription = (items = [], prescriptionText = "") => {
  if (Array.isArray(items) && items.length > 0) return items;
  return String(prescriptionText || "").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [medicine, dosage = "", frequency = "", duration = "", instructions = ""] = line.split("|").map((part) => part.trim());
    return { medicine, dosage, frequency, duration, instructions };
  });
};

const safeAttachments = (attachments = []) => Array.isArray(attachments) ? attachments.slice(0, 20).map((item) => ({
  name: String(item?.name || "Attachment").slice(0, 180),
  storageKey: item?.storageKey ? String(item.storageKey).slice(0, 500) : undefined,
  type: item?.type ? String(item.type).slice(0, 100) : undefined,
  size: Number.isFinite(Number(item?.size)) ? Math.min(Number(item.size), 10 * 1024 * 1024) : undefined,
  status: "quarantined",
})) : [];

const publicRecord = (value) => {
  const data = value?.toObject ? value.toObject() : { ...value };
  delete data.doctorNotes;
  delete data.clinicianPrivateNotes;
  delete data.authorDoctorId;
  delete data.lastEditedBy;
  data.attachments = (data.attachments || []).map(({ name, type, size, status, _id }) => ({ name, type, size, status, id: _id }));
  data.addenda = (data.addenda || []).map(({ text, createdAt }) => ({ text, createdAt }));
  return data;
};

const withPrivateNote = async (req, data, record) => {
  if (!req || !["doctor", "admin"].includes(req.user?.role)) return data;
  const note = await ClinicalNote.findOne({ medicalRecordId: record._id }).select("notes authorUserId finalizedAt").lean();
  return note ? { ...data, clinicianPrivateNotes: note.notes, privateNoteFinalizedAt: note.finalizedAt } : data;
};

const writeRevision = (record, userId, kind = "snapshot") => MedicalRecordRevision.create({
  medicalRecordId: record._id,
  revision: record.revision || 1,
  kind,
  authorUserId: userId,
  fields: {
    diagnosis: record.diagnosis,
    symptoms: record.symptoms,
    prescription: record.prescription,
    treatmentPlan: record.treatmentPlan,
    patientInstructions: record.patientInstructions,
    followUpDate: record.followUpDate,
    attachments: record.attachments?.map(({ name, type, size, status }) => ({ name, type, size, status })),
  },
});

const saveClinicalNote = async ({ record, doctor, userId, notes, req }) => {
  if (notes === undefined) return;
  const value = String(notes || "").trim();
  if (value.length > 20000) throw new Error("Private clinical notes are too long");
  const current = await ClinicalNote.findOne({ medicalRecordId: record._id });
  if (current?.finalizedAt) throw Object.assign(new Error("Finalized private notes require an addendum"), { code: "FINALIZED_RECORD" });
  const next = current || new ClinicalNote({ medicalRecordId: record._id, appointmentId: record.appointmentId, patientId: record.patientId, doctorId: doctor._id, notes: value, authorUserId: userId });
  if (current) next.revisions.push({ notes: current.notes, authorUserId: current.authorUserId });
  next.notes = value; next.authorUserId = userId;
  await next.save();
  await writeAuditEvent(req, "clinical-note-edit", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString(), revision: next.revisions.length + 1 } });
};

export const createMedicalRecord = async (req, res) => {
  try {
    const { appointmentId, diagnosis, prescription, prescriptionText, treatmentPlan, patientInstructions, clinicianPrivateNotes, doctorNotes, followUpDate, attachments } = req.body;
    const scope = await ensureAppointmentScope(req, appointmentId);
    if (!scope) return res.status(403).json({ success: false, error: "Not authorized for this appointment" });
    if (!diagnosis?.trim()) return res.status(400).json({ success: false, error: "Diagnosis is required" });
    let record = await MedicalRecord.findOne({ appointmentId });
    if (record?.finalizedAt) return res.status(409).json({ success: false, error: "This clinical record is finalized; add an addendum instead" });
    if (!record) record = new MedicalRecord({ appointmentId, patientId: scope.appointment.patientId, doctorId: scope.appointment.doctorId, authorDoctorId: scope.doctor._id, revision: 1 });
    else record.revision = (record.revision || 1) + 1;
    Object.assign(record, { diagnosis: diagnosis.trim(), symptoms: scope.appointment.symptoms, prescription: parsePrescription(prescription, prescriptionText), treatmentPlan, patientInstructions, followUpDate: followUpDate || undefined, attachments: safeAttachments(attachments), lastEditedBy: req.user._id, authorDoctorId: scope.doctor._id });
    await record.save();
    await saveClinicalNote({ record, doctor: scope.doctor, userId: req.user._id, notes: clinicianPrivateNotes ?? doctorNotes, req });
    await writeRevision(record, req.user._id);
    await writeAuditEvent(req, "medical-record-edit", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString(), revision: record.revision } });
    const populated = await populateRecord(MedicalRecord.findById(record._id));
    res.status(201).json({ success: true, message: "Medical record saved", data: await withPrivateNote(req, publicRecord(await populated), record) });
  } catch (error) {
    const status = error.code === "FINALIZED_RECORD" ? 409 : 500;
    res.status(status).json({ success: false, error: status === 409 ? error.message : "Medical record could not be saved" });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === "patient") query.patientId = req.user.id;
    else if (req.user.role === "doctor") {
      const doctor = await getDoctorForUser(req.user.id);
      if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });
      query.doctorId = doctor._id;
      if (req.query.patientId && mongoose.Types.ObjectId.isValid(req.query.patientId)) query.patientId = req.query.patientId;
    } else if (req.user.role === "admin" && breakGlassReason(req).length >= 10) {
      if (req.query.patientId && mongoose.Types.ObjectId.isValid(req.query.patientId)) query.patientId = req.query.patientId;
      await writeAuditEvent(req, "medical-record-list-break-glass", "success", { metadata: { reasonLength: breakGlassReason(req).length } });
    } else return res.status(403).json({ success: false, error: "A support reason is required" });
    const records = await populateRecord(MedicalRecord.find(query)).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: records.length, data: records.map(publicRecord) });
  } catch { res.status(500).json({ success: false, error: "Medical records could not be loaded" }); }
};

export const getMedicalRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, error: "Invalid medical record ID" });
    const record = await MedicalRecord.findById(req.params.id).select(publicProjection).lean();
    if (!record) return res.status(404).json({ success: false, error: "Medical record not found" });
    if (!(await authorizeScope(req, record, { allowAdmin: true }))) return res.status(403).json({ success: false, error: "Not authorized" });
    await writeAuditEvent(req, "medical-record-read", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString() } });
    const populated = await populateRecord(MedicalRecord.findById(record._id)).lean();
    res.status(200).json({ success: true, data: await withPrivateNote(req, publicRecord(populated), record) });
  } catch { res.status(500).json({ success: false, error: "Medical record could not be loaded" }); }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, error: "Invalid medical record ID" });
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: "Medical record not found" });
    if (!(await authorizeScope(req, record))) return res.status(403).json({ success: false, error: "Not authorized" });
    if (record.finalizedAt) return res.status(409).json({ success: false, error: "This clinical record is finalized; use an addendum" });
    const allowed = ["diagnosis", "prescription", "treatmentPlan", "patientInstructions", "followUpDate"];
    allowed.forEach((field) => { if (req.body[field] !== undefined) record[field] = req.body[field]; });
    if (req.body.prescriptionText !== undefined) record.prescription = parsePrescription(req.body.prescription, req.body.prescriptionText);
    if (req.body.attachments !== undefined) record.attachments = safeAttachments(req.body.attachments);
    record.revision = (record.revision || 1) + 1; record.lastEditedBy = req.user._id;
    await record.save();
    const doctor = await getDoctorForUser(req.user.id);
    await saveClinicalNote({ record, doctor, userId: req.user._id, notes: req.body.clinicianPrivateNotes ?? req.body.doctorNotes, req });
    await writeRevision(record, req.user._id);
    await writeAuditEvent(req, "medical-record-edit", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString(), revision: record.revision } });
    const populated = await populateRecord(MedicalRecord.findById(record._id));
    res.status(200).json({ success: true, message: "Medical record updated", data: await withPrivateNote(req, publicRecord(await populated), record) });
  } catch (error) { res.status(error.code === "FINALIZED_RECORD" ? 409 : 500).json({ success: false, error: error.code === "FINALIZED_RECORD" ? error.message : "Medical record could not be updated" }); }
};

export const finalizeMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record || !(await authorizeScope(req, record))) return res.status(403).json({ success: false, error: "Not authorized" });
    record.finalizedAt = new Date(); await record.save();
    await ClinicalNote.updateOne({ medicalRecordId: record._id }, { $set: { finalizedAt: record.finalizedAt } });
    await writeAuditEvent(req, "medical-record-finalize", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString() } });
    res.status(200).json({ success: true, data: { finalizedAt: record.finalizedAt } });
  } catch { res.status(500).json({ success: false, error: "Medical record could not be finalized" }); }
};

export const addMedicalRecordAddendum = async (req, res) => {
  try {
    const text = String(req.body.text || "").trim();
    const record = await MedicalRecord.findById(req.params.id);
    const doctor = await getDoctorForUser(req.user.id);
    if (!record || !doctor || idOf(record.doctorId) !== doctor._id.toString() || text.length < 1 || text.length > 20000) return res.status(403).json({ success: false, error: "Not authorized" });
    record.addenda.push({ text, authorDoctorId: doctor._id, authorUserId: req.user._id });
    await record.save();
    await MedicalRecordRevision.create({ medicalRecordId: record._id, revision: (record.revision || 1) + 1, kind: "addendum", authorUserId: req.user._id, fields: { text } });
    await writeAuditEvent(req, "medical-record-addendum", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString() } });
    res.status(201).json({ success: true, data: publicRecord(record) });
  } catch { res.status(500).json({ success: false, error: "Addendum could not be saved" }); }
};

export const downloadMedicalAttachment = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, error: "Invalid medical record ID" });
  const record = await MedicalRecord.findById(req.params.id).select("patientId doctorId attachments").lean();
  if (!record || !(await authorizeScope(req, record, { allowAdmin: true }))) return res.status(403).json({ success: false, error: "Not authorized" });
  const attachment = record.attachments?.find((item) => item._id.toString() === req.params.attachmentId && item.status === "available");
  if (!attachment?.storageKey) return res.status(404).json({ success: false, error: "Attachment unavailable" });
  await writeAuditEvent(req, "medical-attachment-read", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString() } });
  const cloudinary = (await import("../config/cloudinary.js")).default;
  const url = cloudinary.utils.private_download_url(attachment.storageKey, attachment.format || "pdf", {
    resource_type: attachment.resourceType || "raw",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 300,
  });
  res.set("Cache-Control", "no-store");
  return res.redirect(302, url);
};

export const uploadMedicalAttachment = async (req, res) => {
  let uploaded;
  try {
    const record = await MedicalRecord.findById(req.params.id);
    const doctor = await getDoctorForUser(req.user.id);
    if (!record || !doctor || idOf(record.doctorId) !== doctor._id.toString()) return res.status(403).json({ success: false, error: "Not authorized" });
    if (record.finalizedAt) return res.status(409).json({ success: false, error: "Finalized records require an addendum" });
    if (!req.file) return res.status(400).json({ success: false, error: "Attachment is required" });
    const cloudinary = (await import("../config/cloudinary.js")).default;
    const dataURI = `data:${req.file.detectedType};base64,${Buffer.from(req.file.buffer).toString("base64")}`;
    uploaded = await cloudinary.uploader.upload(dataURI, { folder: "curevo/medical-records", resource_type: "auto", type: "authenticated" });
    record.attachments.push({ name: String(req.body.name || req.file.originalname || "Medical attachment").slice(0, 180), storageKey: uploaded.public_id, resourceType: uploaded.resource_type, format: uploaded.format, size: req.file.size, type: req.file.detectedType, status: "quarantined" });
    record.revision = (record.revision || 1) + 1; record.lastEditedBy = req.user._id;
    await record.save();
    await writeAuditEvent(req, "medical-attachment-upload", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString(), status: "quarantined" } });
    res.status(201).json({ success: true, message: "Attachment quarantined for malware review", data: publicRecord(record) });
  } catch {
    if (uploaded?.public_id) {
      try { const cloudinary = (await import("../config/cloudinary.js")).default; await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: uploaded.resource_type || "raw", type: "authenticated" }); } catch { /* cleanup is retried by retention sweep */ }
    }
    res.status(500).json({ success: false, error: "Attachment could not be uploaded" });
  }
};

export const releaseMedicalAttachment = async (req, res) => {
  const reason = breakGlassReason(req);
  if (req.user.role !== "admin" || reason.length < 10) return res.status(403).json({ success: false, error: "A support reason is required" });
  const record = await MedicalRecord.findById(req.params.id);
  const attachment = record?.attachments?.id(req.params.attachmentId);
  if (!record || !attachment) return res.status(404).json({ success: false, error: "Attachment not found" });
  attachment.status = "available"; await record.save();
  await writeAuditEvent(req, "medical-attachment-release", "success", { targetUserId: record.patientId, metadata: { recordId: record._id.toString(), reasonLength: reason.length } });
  res.status(200).json({ success: true, data: { attachmentId: attachment._id, status: attachment.status } });
};
