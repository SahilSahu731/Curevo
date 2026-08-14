import crypto from "node:crypto";
import AuditEvent from "../models/auditEvent.model.js";
import { hashToken } from "./security.js";

export const socketCorrelationId = () => crypto.randomUUID();

export const writeSocketAudit = async (socket, type, outcome, metadata = {}) => {
  try {
    await AuditEvent.create({
      type,
      outcome,
      actorUserId: socket.data.user?.id,
      correlationId: socket.data.correlationId,
      userAgent: String(socket.handshake.headers["user-agent"] || "socket").slice(0, 300),
      metadata: {
        sessionHash: socket.data.sessionId ? hashToken(`session:${socket.data.sessionId}`) : undefined,
        roomHash: metadata.roomId ? hashToken(`room:${metadata.roomId}`) : undefined,
        event: metadata.event,
        reason: metadata.reason,
      },
      expiresAt: new Date(Date.now() + Number(process.env.AUDIT_RETENTION_DAYS || 365) * 24 * 60 * 60 * 1000),
    });
  } catch {
    // Telehealth audit failures must never write room, identity, or media data to logs.
  }
};
