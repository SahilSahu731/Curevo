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
import { authorize, authorizeAdminScope, protect, requireClinicalAdminScope, requireVerifiedEmail } from "../middlewares/auth.middleware.js";
import upload, { uploadTimeout, validateUploadSignature } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(requireClinicalAdminScope, getMedicalRecords)
  .post(authorize("doctor"), requireVerifiedEmail, createMedicalRecord);

router.route("/:id")
  .get(requireClinicalAdminScope, getMedicalRecord)
  .put(authorize("doctor"), requireVerifiedEmail, updateMedicalRecord);

router.post("/:id/addenda", authorize("doctor"), requireVerifiedEmail, addMedicalRecordAddendum);
router.post("/:id/finalize", authorize("doctor"), requireVerifiedEmail, finalizeMedicalRecord);
router.post("/:id/attachments", authorize("doctor"), requireVerifiedEmail, uploadTimeout, upload.single("attachment"), validateUploadSignature, uploadMedicalAttachment);
router.get("/:id/attachments/:attachmentId", requireClinicalAdminScope, requireVerifiedEmail, downloadMedicalAttachment);
router.post("/:id/attachments/:attachmentId/release", authorize("admin"), authorizeAdminScope("compliance", "super-admin"), requireVerifiedEmail, releaseMedicalAttachment);

export default router;
