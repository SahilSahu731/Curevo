import './config/env.js';
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
import clinicReviewRoutes from './routes/clinicReview.routes.js';

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
app.use(morgan('dev'));
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.use("/api", apiLimiter);
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

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "SmartQueue API is working!" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Unhandled API Error:", error);
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? "Internal Server Error" : error.message,
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
