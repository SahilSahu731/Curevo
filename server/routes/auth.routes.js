import express from 'express'
import { getMe, login, logout, register, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

// --- Protected Routes ---
// These routes require a valid token (checked by 'protect' middleware)
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);

export default router;