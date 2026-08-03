import { validateProductionEnvironment } from './config/env.js';
validateProductionEnvironment();
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocket } from './config/socket.js';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import passport from './config/passport.js'; // Import passport config

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import clinicRoutes from './routes/clinic.route.js';
import doctorRoutes from './routes/doctor.routes.js';
import patientRoutes from './routes/patient.routes.js';
import queueRoutes from './routes/queue.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import medicalRecordRoutes from './routes/medicalRecord.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import clinicReviewRoutes from './routes/clinicReview.routes.js';
import supportRoutes from './routes/support.routes.js';
import { enforceProductionFreeze } from './middlewares/productionFreeze.middleware.js';
import { validateCsrf } from './middlewares/csrf.middleware.js';
import { correlationId, noStore, rejectOperatorInjection } from './middlewares/requestSecurity.middleware.js';

const PORT = process.env.PORT || 5000;
const app = express();
const httpServer = createServer(app);
app.set('trust proxy', 1);

// Initialize Socket.io
initSocket(httpServer);

// Security & Logging Middleware (Improvements)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
})); 
app.use(correlationId);
app.use(morgan((tokens, req, res) => `${tokens.method(req, res)} ${req.path} ${tokens.status(req, res)} ${tokens['response-time'](req, res)} ms`));
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});

// Standard Middleware
app.set('query parser', 'simple');
app.use(express.json({ limit: '100kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '32kb', parameterLimit: 100 }));
app.use(cookieParser());
const allowedClientOrigins = new Set([
    process.env.CLIENT_URL || 'http://localhost:3000',
    ...(process.env.ADDITIONAL_CLIENT_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
].map((origin) => origin.replace(/\/$/, '')));

app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedClientOrigins.has(origin.replace(/\/$/, ''))) return callback(null, true);
      return callback(new Error('Origin is not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.use("/api", noStore);
app.use("/api", apiLimiter);
app.use("/api", rejectOperatorInjection);
app.use("/api", validateCsrf);
app.use("/api", enforceProductionFreeze);
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes)
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

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "SmartQueue API is working!" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((error, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.error("Unhandled API Error:", error.message);
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? "Internal Server Error" : error.message,
    requestId: req.id,
  });
});

// Connect database and start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)
  })
}).catch((error) => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})
