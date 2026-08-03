import crypto from "node:crypto";

const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export const correlationId = (req, res, next) => {
  const supplied = req.get("x-request-id");
  req.id = supplied && /^[a-zA-Z0-9._-]{1,100}$/.test(supplied) ? supplied : crypto.randomUUID();
  res.set("X-Request-ID", req.id);
  next();
};

export const noStore = (req, res, next) => {
  res.set("Cache-Control", "no-store, max-age=0");
  res.set("Pragma", "no-cache");
  next();
};

const containsDangerousKey = (value, depth = 0) => {
  if (!value || typeof value !== "object" || depth > 20) return depth > 20;
  return Object.keys(value).some((key) => (
    key.startsWith("$") || DANGEROUS_KEYS.has(key) || containsDangerousKey(value[key], depth + 1)
  ));
};

export const rejectOperatorInjection = (req, res, next) => {
  if ([req.body, req.query, req.params].some((value) => containsDangerousKey(value))) {
    return res.status(400).json({ success: false, error: "Invalid request structure", requestId: req.id });
  }
  next();
};
