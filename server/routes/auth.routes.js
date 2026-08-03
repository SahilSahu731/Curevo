import express from "express";
import passport from "passport";
import {
  getMe,
  googleCallback,
  listSessions,
  login,
  logout,
  logoutAll,
  register,
  updateDetails,
  updatePassword,
  updateProfileImage,
} from "../controllers/auth.controller.js";
import {
  confirmEmailChange,
  forgotPassword,
  requestEmailChange,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/recovery.controller.js";
import { beginMfaSetup, confirmMfaSetup, disableMfa, verifyMfaLogin } from "../controllers/mfa.controller.js";
import { deleteAccount, exportAccount, recordConsent } from "../controllers/privacy.controller.js";
import {
  accountLoginDelay,
  loginIpLimiter,
  oauthLimiter,
  passwordChangeLimiter,
  recoveryLimiter,
  registrationLimiter,
  resendLimiter,
} from "../middlewares/authRateLimit.middleware.js";
import { issueCsrfToken } from "../middlewares/csrf.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { beginOAuth, validateOAuthState } from "../middlewares/oauthState.middleware.js";
import upload, { validateUploadSignature } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authSchemas } from "../validations/schemas.js";

const router = express.Router();

router.get("/csrf", issueCsrfToken);
router.post("/register", registrationLimiter, upload.none(), validate(authSchemas.register), register);
router.post("/login", loginIpLimiter, accountLoginDelay, validate(authSchemas.login), login);
router.post("/forgot-password", recoveryLimiter, validate(authSchemas.forgotPassword), forgotPassword);
router.post("/reset-password", recoveryLimiter, validate(authSchemas.resetPassword), resetPassword);
router.post("/verify-email", resendLimiter, validate(authSchemas.token), verifyEmail);
router.post("/change-email/confirm", resendLimiter, validate(authSchemas.token), confirmEmailChange);
router.post("/mfa/verify", loginIpLimiter, validate(authSchemas.mfaLogin), verifyMfaLogin);

router.get("/google", oauthLimiter, beginOAuth, (req, res, next) => passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
  state: req.oauthState,
})(req, res, next));

router.get("/google/callback", oauthLimiter, validateOAuthState, passport.authenticate("google", {
  failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  session: false,
}), googleCallback);

router.use(protect);
router.get("/me", getMe);
router.get("/sessions", listSessions);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.get("/export", exportAccount);
router.post("/consents", recordConsent);
router.delete("/account", deleteAccount);
router.put("/password", passwordChangeLimiter, validate(authSchemas.passwordChange), updatePassword);
router.put("/updatedetails", updateDetails);
router.put("/updateimage", upload.single("image"), validateUploadSignature, updateProfileImage);
router.post("/verify-email/resend", resendLimiter, resendVerification);
router.post("/change-email", passwordChangeLimiter, validate(authSchemas.emailChange), requestEmailChange);
router.post("/mfa/setup", beginMfaSetup);
router.post("/mfa/confirm", validate(authSchemas.mfaCode), confirmMfaSetup);
router.post("/mfa/disable", passwordChangeLimiter, validate(authSchemas.mfaDisable), disableMfa);
router.get("/google/link", oauthLimiter, beginOAuth, (req, res, next) => passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
  state: req.oauthState,
})(req, res, next));

export default router;
