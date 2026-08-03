import express from "express";
import {
  createMedicalRecord,
  addMedicalRecordAddendum,
  downloadMedicalAttachment,
  finalizeMedicalRecord,
  releaseMedicalAttachment,
  uploadMedicalAttachment,
  getMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
} from "../controllers/medicalRecord.controller.js";
import { authorize, protect, requireVerifiedEmail } from "../middlewares/auth.middleware.js";
import upload, { uploadTimeout, validateUploadSignature } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getMedicalRecords)
  .post(authorize("doctor"), requireVerifiedEmail, createMedicalRecord);

router.route("/:id")
  .get(getMedicalRecord)
  .put(authorize("doctor"), requireVerifiedEmail, updateMedicalRecord);

router.post("/:id/addenda", authorize("doctor"), requireVerifiedEmail, addMedicalRecordAddendum);
router.post("/:id/finalize", authorize("doctor"), requireVerifiedEmail, finalizeMedicalRecord);
router.post("/:id/attachments", authorize("doctor"), requireVerifiedEmail, uploadTimeout, upload.single("attachment"), validateUploadSignature, uploadMedicalAttachment);
router.get("/:id/attachments/:attachmentId", requireVerifiedEmail, downloadMedicalAttachment);
router.post("/:id/attachments/:attachmentId/release", authorize("admin"), requireVerifiedEmail, releaseMedicalAttachment);

export default router;
