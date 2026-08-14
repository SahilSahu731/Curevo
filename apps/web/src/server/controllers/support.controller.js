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

export const getSupportTickets = async (req, res) => {
  const { page = 1, limit = 20, status = "all", category = "all", search = "", sortOrder = "desc" } = req.query;
  const query = {};
  if (status !== "all") query.status = status;
  if (category !== "all") query.category = category;
  if (search) {
    const escaped = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [{ reference: { $regex: escaped, $options: "i" } }, { subject: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }];
  }
  const [tickets, count] = await Promise.all([
    SupportTicket.find(query).setOptions({ sanitizeFilter: false }).sort({ createdAt: sortOrder === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit),
    SupportTicket.countDocuments(query).setOptions({ sanitizeFilter: false }),
  ]);
  return res.status(200).json({ success: true, count, currentPage: page, totalPages: Math.max(1, Math.ceil(count / limit)), data: tickets });
};

export const updateSupportTicket = async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!ticket) return res.status(404).json({ success: false, error: "Support ticket not found" });
  await writeAuditEvent(req, "support-ticket-updated", "success", { metadata: { reference: ticket.reference, status: ticket.status } });
  return res.status(200).json({ success: true, message: "Support ticket updated", data: ticket });
};
