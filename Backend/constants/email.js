import nodemailer from "nodemailer";
import "../config/loadEnv.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
export const sendMail = async (fromEmail, toEmail) => {
  try {
    const subject = "invitation to collaborate";
    const toName = toEmail.split("@")[0];
    const fromName = fromEmail.split("@")[0];
    const text = `Hello ${toName},\n You have been invited by ${fromName} to collaborate on his event!\n 
    for more information on the event you can navigate to CelebrightEMS.com and view the invitation details.\n
    good luck and happy planning!\n
    CelebrightEMS Team`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      text,
    };
    await transporter.sendEmail(mailOptions);
  } catch (err) {
    throw new GeneralServerError(err.message);
  }
};
