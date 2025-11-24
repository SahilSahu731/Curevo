import express from 'express'
import { getMe, login, logout, register, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import multer from 'multer'

const router = express.Router();

// Use multer to parse multipart/form-data (FormData) without files
const upload = multer()

// Accept either JSON or FormData for registration. If client sends FormData (no files),
// `upload.none()` will parse the text fields into `req.body`.
router.post("/register", upload.none(), register);
router.post("/login", login);
router.get("/logout", logout);

// --- Protected Routes ---
// These routes require a valid token (checked by 'protect' middleware)
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);

export default router;