import express from "express";
import { createFeedback, getMyFeedback } from "../controllers/feedback.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { feedbackSchemas } from "../validations/schemas.js";

const router = express.Router();

router.use(protect);
router.post("/", validate(feedbackSchemas.create), createFeedback);
router.get("/me", getMyFeedback);

export default router;
