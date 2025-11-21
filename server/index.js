import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';

const PORT = process.env.PORT || 3000
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(cors());

//api
app.use("/api/auth", authRoutes);

// connect database
connectDB();

//test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});



app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)
})