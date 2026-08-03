import express from "express";
import { getNotificationPreferences, listNotifications, markNotificationRead, updateNotificationPreferences } from "../controllers/notification.controller.js";
import { protect, requireVerifiedEmail } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protect, requireVerifiedEmail);
router.get("/", listNotifications);
router.patch("/read/:id", markNotificationRead);
router.get("/preferences", getNotificationPreferences);
router.put("/preferences", updateNotificationPreferences);
export default router;
