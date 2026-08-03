import crypto from "node:crypto";

const COMMON_PASSWORDS = new Set([
  "123456789012", "password1234", "qwerty123456", "letmein123456",
  "admin12345678", "welcome123456", "password123!", "iloveyou12345",
]);

export const validatePasswordPolicy = async (password, user = {}) => {
  const value = String(password || "");
  if (value.length < 12 || value.length > 128) return "Password must be between 12 and 128 characters";
  const normalized = value.toLowerCase();
  if (COMMON_PASSWORDS.has(normalized)) return "Choose a password that has not appeared in common password lists";
  const identityParts = [user.email?.split("@")[0], user.name]
    .filter(Boolean)
    .flatMap((part) => String(part).toLowerCase().split(/[^a-z0-9]+/))
    .filter((part) => part.length >= 4);
  if (identityParts.some((part) => normalized.includes(part))) return "Password must not contain your name or email";

  if (process.env.HIBP_PASSWORD_CHECK === "true") {
    const digest = crypto.createHash("sha1").update(value).digest("hex").toUpperCase();
    const response = await fetch(`https://api.pwnedpasswords.com/range/${digest.slice(0, 5)}`, {
      headers: { "Add-Padding": "true", "User-Agent": "Curevo-Password-Policy" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Password breach check unavailable");
    const suffix = digest.slice(5);
    if ((await response.text()).split("\n").some((line) => line.startsWith(`${suffix}:`))) {
      return "Choose a password that has not appeared in a known data breach";
    }
  }
  return null;
};
