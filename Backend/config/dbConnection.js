import mongoose from "mongoose";
import "./loadEnv.js";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
  } catch (err) {
    console.error(err);
    //stam
  }
};

export default connectDB;
