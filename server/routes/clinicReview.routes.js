import express from "express";
import rateLimit from "express-rate-limit";
import { appealClinicReviewModeration, createClinicReview, getClinicReviews, moderateClinicReview, reportClinicReview, respondToClinicReview, updateClinicReview, withdrawClinicReview } from "../controllers/clinicReview.controller.js";
import { authorize, protect, requireVerifiedEmail } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:clinicId", getClinicReviews);
const reviewLimiter = rateLimit({ windowMs: 60 * 60_000, limit: 8, standardHeaders: true, legacyHeaders: false });
router.post("/", protect, authorize("patient"), requireVerifiedEmail, reviewLimiter, createClinicReview);
router.patch("/:id", protect, authorize("patient"), requireVerifiedEmail, reviewLimiter, updateClinicReview);
router.delete("/:id", protect, authorize("patient"), requireVerifiedEmail, withdrawClinicReview);
router.post("/:id/report", protect, requireVerifiedEmail, reviewLimiter, reportClinicReview);
router.post("/:id/response", protect, authorize("doctor"), requireVerifiedEmail, respondToClinicReview);
router.post("/:id/appeal", protect, authorize("doctor"), requireVerifiedEmail, appealClinicReviewModeration);
router.patch("/:id/moderate", protect, authorize("admin"), moderateClinicReview);

export default router;
