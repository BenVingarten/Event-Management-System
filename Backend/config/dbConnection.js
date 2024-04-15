import mongoose from "mongoose";
import { config } from "dotenv";

config();

const URI = process.env.DATABASE_URI;
export const connectDB = async () => {
    try {
        await mongoose.connect(URI);
    } catch (err){
        console.error(err);
    }
}