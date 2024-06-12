import nodemailer from "nodemailer";
import "../config/loadEnv.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
export const sendMail = async (to) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    const info = await transporter.sendEmail(mailOptions);
  } catch (err) {
    throw new GeneralServerError(err.message);
  }
};
