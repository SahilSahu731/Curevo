import AuditEvent from "../models/auditEvent.model.js";
import { hashIp, requestIp } from "./security.js";

const RETENTION_DAYS = Number(process.env.AUDIT_RETENTION_DAYS || 365);

export const writeAuditEvent = async (req, type, outcome, details = {}) => {
  try {
    await AuditEvent.create({
      type,
      outcome,
      actorUserId: details.actorUserId || req.user?._id,
      targetUserId: details.targetUserId,
      correlationId: req.id,
      ipHash: hashIp(requestIp(req)),
      userAgent: String(req.get?.("user-agent") || "unknown").slice(0, 300),
      metadata: details.metadata || {},
      expiresAt: new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000),
    });
  } catch {
    // Audit persistence failure must not leak request or user content into application logs.
  }
};
