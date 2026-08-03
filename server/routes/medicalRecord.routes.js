import express from "express";
import {
  createMedicalRecord,
  getMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
} from "../controllers/medicalRecord.controller.js";
import { authorize, protect, requireVerifiedEmail } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getMedicalRecords)
  .post(authorize("doctor", "admin"), requireVerifiedEmail, createMedicalRecord);

router.route("/:id")
  .get(getMedicalRecord)
  .put(authorize("doctor", "admin"), requireVerifiedEmail, updateMedicalRecord);

export default router;
