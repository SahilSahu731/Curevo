import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter !== undefined) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    transporter = null;
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
};

export const sendAccountEmail = async ({ to, subject, text }) => {
  const transport = getTransporter();
  if (!transport) return { delivered: false, reason: "not-configured" };
  await transport.sendMail({
    from: process.env.EMAIL_FROM || "Curevo <no-reply@localhost>",
    to,
    subject,
    text,
  });
  return { delivered: true };
};

export const accountLink = (path, token) => {
  const base = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
  // Keep one-time credentials in the fragment so hosts and referrer logs do not receive them.
  return `${base}${path}#token=${encodeURIComponent(token)}`;
};
