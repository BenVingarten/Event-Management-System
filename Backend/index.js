import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/dbConnection.js";
import routes from './routes/allRoutes.js';
import { logger } from "./middleware/logger.js";
import cors from 'cors';
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use(routes);

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Listening for request on port ${PORT}`);
    });
});


