import express from "express";
import mongoose from "mongoose";
import conncetDB from "./config/dbConnection.js";
import allRoutes from "./routes/allRoutes.js";
import cookieParser from "cookie-parser";
import corsOptions from "./config/CorsOptions.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;
conncetDB();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(allRoutes);

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB");
  app.listen(PORT, () => {
    console.log(`Listening for requests on port ${PORT}`);
  });
});
