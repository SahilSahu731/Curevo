import express from "express";
import { getClinicReviews, createClinicReview } from "../controllers/clinicReview.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:clinicId", getClinicReviews);
router.post("/", protect, createClinicReview);

export default router;
