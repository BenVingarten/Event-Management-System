import nodemailer from "nodemailer";
import "../config/loadEnv.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";

export const collabAddingInvitationDetails = (
  ownerUsername,
  collabEmail
) => {
  const collabName = collabEmail.split("@")[0];
  const subject = "Invitation To Collaborate";
  const text = `Hello ${collabName},\nYou have been invited by the user: ${ownerUsername} to collaborate on his event!\nfor more information on the event you can navigate to CelebrightEMS.com and view the invitation details.\ngood luck and happy planning!\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: collabEmail,
    subject,
    text,
  };
  return mailOptions;
};
export const collabInvitationSResponseDetails = (
  ownerEmail,
  collabEmail,
  status
) => {
  const collabName = collabEmail.split("@")[0];
  const ownerName = ownerEmail.split("@")[0];
  const subject = `Invitation To Collaborate ${status}`;
  const text = `Hello ${ownerName},\nthe invitation you sent for ${collabName} for collaboration on your event has been ${status}\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject,
    text,
  };
  return mailOptions;
};
export const collabRemovalDetails = (ownerUsername, collabEmail, eventName) => {
  const collabName = collabEmail.split("@")[0];
  const subject = `Removal From "${eventName}" Event `;
  const text = `Hello ${collabName},\nthe owner: ${ownerUsername} of the event: "${eventName}" has decided to remove you from participating in the event planning process\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: collabEmail,
    subject,
    text,
  };
  return mailOptions;
};
export const sendWebsiteEmail = async (mailOptions) => {
  try {
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
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new GeneralServerError(
      `unexpected error in sending email ${err.message}`
    );
  }
};