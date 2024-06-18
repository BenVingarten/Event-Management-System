import nodemailer from "nodemailer";
import "../config/loadEnv.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
export const sendCollabMail = async (fromEmail, toEmail) => {
  try {
    const subject = "invitation to collaborate";
    const toName = toEmail.split("@")[0];
    const fromName = fromEmail.split("@")[0];
    const text = `Hello ${toName},\n You have been invited by ${fromName} to collaborate on his event!\n 
    for more information on the event you can navigate to CelebrightEMS.com and view the invitation details.\n
    good luck and happy planning!\n
    Best regards, CelebrightEMS Team`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      text,
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new GeneralServerError(
      `unexpected error in sending email to collaborator: ${err.message}`
    );
  }
};
