import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3000
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(cors());


//test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});



app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)
})