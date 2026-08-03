import { createAccountToken } from "./accountToken.js";
import { accountLink, sendAccountEmail } from "./mail.js";

export const sendVerificationEmail = async (user) => {
  const { rawToken } = await createAccountToken({ userId: user._id, type: "email-verify", ttlMinutes: 24 * 60 });
  return sendAccountEmail({
    to: user.email,
    subject: "Verify your Curevo email",
    text: `Verify your email within 24 hours: ${accountLink("/verify-email", rawToken)}`,
  });
};

export const sendPasswordResetEmail = async (user) => {
  const { rawToken } = await createAccountToken({ userId: user._id, type: "password-reset", ttlMinutes: 30 });
  return sendAccountEmail({
    to: user.email,
    subject: "Reset your Curevo password",
    text: `Reset your password within 30 minutes: ${accountLink("/reset-password", rawToken)}`,
  });
};
