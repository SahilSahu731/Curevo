import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import clinicRoutes from './routes/clinic.route.js';
import doctorRoutes from './routes/doctor.routes.js';

const PORT = process.env.PORT || 3000
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

//api
app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes)
app.use("/api/doctors", doctorRoutes);

//test route
app.get("/testt", (req, res) => {
  res.json({ message: "Server is working!" });
});

// connect database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)
  })
}).catch((error) => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})