import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import passport from "./config/passport.js";
import { validateProductionEnvironment } from "./config/env.js";
import adminRoutes from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import clinicRoutes from "./routes/clinic.route.js";
import clinicReviewRoutes from "./routes/clinicReview.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import medicalRecordRoutes from "./routes/medicalRecord.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import supportRoutes from "./routes/support.routes.js";
import { validateCsrf } from "./middlewares/csrf.middleware.js";
import { enforceProductionFreeze } from "./middlewares/productionFreeze.middleware.js";
import { correlationId, noStore, rejectOperatorInjection } from "./middlewares/requestSecurity.middleware.js";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});

const normalizedOrigins = () => new Set([
  process.env.CLIENT_URL || "http://localhost:3000",
  ...(process.env.ADDITIONAL_CLIENT_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
].map((origin) => origin.replace(/\/$/, "")));

export function createApplication({ nextHandler } = {}) {
  validateProductionEnvironment();

  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Next-owned API paths are an explicit GET-only allowlist. Any future mutation
  // must first receive controls equivalent to the Express CSRF/freeze/rate-limit
  // boundary below; it must not be added to this pass-through casually.
  if (nextHandler) {
    app.get("/api/blog/preview", (req, res, next) => {
      Promise.resolve(nextHandler(req, res)).catch(next);
    });
  }

  app.get("/_health", (req, res) => {
    res.status(200).json({ message: "Curevo web and API are working!" });
  });

  // These controls are intentionally scoped to the API. Applying Helmet's default
  // CSP to Next.js pages here would block the framework's generated scripts.
  app.use("/api", helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use("/api", correlationId);
  app.use("/api", morgan((tokens, req, res) => `${tokens.method(req, res)} ${req.path} ${tokens.status(req, res)} ${tokens["response-time"](req, res)} ms`));
  app.use("/api", compression());
  app.set("query parser", "simple");
  app.use("/api", express.json({ limit: "100kb", strict: true }));
  app.use("/api", express.urlencoded({ extended: false, limit: "32kb", parameterLimit: 100 }));
  app.use("/api", cookieParser());

  const allowedClientOrigins = normalizedOrigins();
  app.use("/api", cors({
    origin: (origin, callback) => {
      if (!origin || allowedClientOrigins.has(origin.replace(/\/$/, ""))) return callback(null, true);
      const error = new Error("Origin is not allowed");
      error.status = 403;
      return callback(error);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }));
  app.use("/api", passport.initialize());

  app.use("/api", noStore);
  app.use("/api", apiLimiter);
  app.use("/api", rejectOperatorInjection);
  app.use("/api", validateCsrf);
  app.use("/api", enforceProductionFreeze);
  app.use("/api/auth", authRoutes);
  app.use("/api/clinics", clinicRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/queue", queueRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/medical-records", medicalRecordRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/clinic-reviews", clinicReviewRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/support", supportRoutes);

  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, error: "Route not found", requestId: req.id });
  });

  app.use((error, req, res, next) => {
    if (!req.originalUrl.startsWith("/api")) return next(error);
    if (process.env.NODE_ENV !== "production") console.error("Unhandled API Error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
      requestId: req.id,
    });
  });

  if (nextHandler) {
    app.use((req, res, next) => {
      Promise.resolve(nextHandler(req, res)).catch(next);
    });
  } else {
    app.use((req, res) => {
      res.status(404).json({ success: false, error: "Route not found" });
    });
  }

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (process.env.NODE_ENV !== "production") console.error("Unhandled web error:", error.message);
    return res.status(500).type("text/plain").send("Curevo could not complete this request.");
  });

  return app;
}
