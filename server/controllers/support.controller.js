import crypto from "node:crypto";
import SupportTicket from "../models/supportTicket.model.js";
import { writeAuditEvent } from "../utils/audit.js";
import { sendAccountEmail } from "../utils/mail.js";
import { hashIp, requestIp } from "../utils/security.js";

const RETENTION_DAYS = Math.min(Math.max(Number(process.env.SUPPORT_RETENTION_DAYS || 180), 30), 730);

const referenceNumber = () => {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `SUP-${day}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

export const createSupportTicket = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const recentCount = await SupportTicket.countDocuments({
    email,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });
  if (recentCount >= 3) {
    await writeAuditEvent(req, "support-ticket-throttled", "failure", { metadata: { reason: "email-limit" } });
    return res.status(429).json({ success: false, error: "Too many requests. Please try again later.", requestId: req.id });
  }

  const reference = referenceNumber();
  const inbox = String(process.env.SUPPORT_INBOX || "").trim();
  let delivery = { delivered: false, reason: "not-configured" };
  if (inbox) {
    try {
      delivery = await sendAccountEmail({
        to: inbox,
        subject: `[${reference}] ${req.body.category}: ${req.body.subject}`,
        text: [
          `Reference: ${reference}`,
          `Category: ${req.body.category}`,
          `From: ${req.body.name} <${email}>`,
          "",
          req.body.message,
        ].join("\n"),
      });
    } catch {
      delivery = { delivered: false, reason: "failed" };
    }
  }

  const deliveryStatus = delivery.delivered ? "delivered" : delivery.reason === "failed" ? "failed" : "not-configured";
  await SupportTicket.create({
    reference,
    name: req.body.name,
    email,
    category: req.body.category,
    subject: req.body.subject,
    message: req.body.message,
    delivery: { status: deliveryStatus, attemptedAt: new Date() },
    ipHash: hashIp(requestIp(req)),
    expiresAt: new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000),
  });
  await writeAuditEvent(req, "support-ticket-created", "success", {
    metadata: { reference, category: req.body.category, deliveryStatus },
  });

  return res.status(202).json({
    success: true,
    message: deliveryStatus === "delivered"
      ? "Your request was accepted and delivered to the support inbox."
      : "Your request was accepted and saved for support review; inbox delivery is not yet confirmed.",
    data: { reference, accepted: true, delivered: deliveryStatus === "delivered" },
  });
};
