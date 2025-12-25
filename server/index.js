import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocket } from './config/socket.js';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './config/passport.js'; // Import passport config

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import clinicRoutes from './routes/clinic.route.js';
import doctorRoutes from './routes/doctor.routes.js';
import patientRoutes from './routes/patient.routes.js';
import queueRoutes from './routes/queue.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reviewRoutes from './routes/review.routes.js';
import clinicReviewRoutes from './routes/clinicReview.routes.js';

const PORT = process.env.PORT || 5000;
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Security & Logging Middleware (Improvements)
app.use(helmet()); 
app.use(morgan('dev'));

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes)
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes); 
app.use("/api/queue", queueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/clinic-reviews", clinicReviewRoutes);

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "SmartQueue API is working!" });
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