import express from "express";
import rateLimit from "express-rate-limit";
import { createSupportTicket } from "../controllers/support.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { supportSchemas } from "../validations/schemas.js";

const router = express.Router();
const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
});

router.post("/tickets", supportLimiter, validate(supportSchemas.create), createSupportTicket);

export default router;
