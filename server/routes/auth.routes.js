import express from 'express'
import { getMe, googleCallback, login, logout, register, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import passport from 'passport';
import multer from 'multer'

const router = express.Router();
const upload = multer()

router.post("/register", upload.none(), register);
router.post("/login", login);
router.get("/logout", logout);

// --- Google Auth Routes ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleCallback
);

// --- Protected Routes ---
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);

export default router;