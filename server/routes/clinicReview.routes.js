import express from "express";
import { getClinicReviews, createClinicReview } from "../controllers/clinicReview.controller.js";
import { authorize, protect, requireVerifiedEmail } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:clinicId", getClinicReviews);
router.post("/", protect, authorize("patient"), requireVerifiedEmail, createClinicReview);

export default router;
