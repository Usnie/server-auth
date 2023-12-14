import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import authRouter from './routes/authRouter.js'
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express();   
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    credentials:true
}))
app.use('/auth',authRouter)

const PORT = process.env.PORT || 4000

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        app.listen(PORT, () => {
            console.log("Server is running in port " + PORT)
        })
    }
    catch(e) {
        console.log(e)
    }
} 

start();