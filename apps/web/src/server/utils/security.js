import crypto from "node:crypto";

const secret = () => {
  const value = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (!value) throw new Error("SESSION_SECRET is required");
  return value;
};

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");

export const hashToken = (value) => crypto
  .createHmac("sha256", secret())
  .update(String(value))
  .digest("hex");

export const hashIp = (value = "unknown") => hashToken(`ip:${value}`);

export const safeEqual = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const encryptionKey = () => crypto.createHash("sha256").update(`enc:${secret()}`).digest();

export const encryptSecret = (plaintext) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
};

export const decryptSecret = (encoded) => {
  const [iv, tag, ciphertext] = String(encoded).split(".").map((part) => Buffer.from(part, "base64url"));
  if (!iv || !tag || !ciphertext) throw new Error("Invalid encrypted value");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
};

export const requestIp = (req) => req.ip || req.socket?.remoteAddress || "unknown";
