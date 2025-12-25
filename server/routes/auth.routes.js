import express from 'express'
import { getMe, googleCallback, login, logout, register, updatePassword, updateDetails, updateProfileImage } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import passport from 'passport';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

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
router.use(protect); // Cleaner than adding protect to each
router.get("/me", getMe);
router.put("/password", updatePassword);
router.put("/updatedetails", updateDetails);
router.put("/updateimage", upload.single('image'), updateProfileImage);

export default router;