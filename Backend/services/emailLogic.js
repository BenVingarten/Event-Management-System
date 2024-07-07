import nodemailer from "nodemailer";
import "../config/loadEnv.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import moment from "moment-timezone";

// Adding collaborator invitation
export const collabAddingInvitationDetails = (ownerUsername, collabEmail) => {
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
// collaborator response for invitation (accpet/declined) - WORKS
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
// event planner delete his event - notify his collaborators.
export const deletingEventlDetails = (
  ownerUsername,
  collabEmail,
  eventName
) => {
  const collabName = collabEmail.split("@")[0];
  const subject = `"${eventName}" Event no longer exists`;
  const text = `Hello ${collabName},\nthe owner: ${ownerUsername} of the event: "${eventName}" has decided to delete the event. thus the event is no longer exists\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: collabEmail,
    subject,
    text,
  };
  return mailOptions;
};
// collaborator decide to leave the event - WORKS
export const collabExitEventDetails = (
  ownerDetails,
  collabDetails,
  eventName
) => {
  const { collabName, collabEmail } = collabDetails;
  const { ownerName, ownerEmail } = ownerDetails;
  const subject = `Exiting From "${eventName}" Event `;
  const text = `Hello ${ownerName},\nYour collaborator: "${collabName}", of the event: "${eventName}" has decided to remove himself from collaborating with you.\nYou can contact the collaborator in ${collabEmail}.\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject,
    text,
  };
  return mailOptions;
};
// event planner owner decides to remove collaborator
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
// email for vendor to let him know about hiring him - WORKS
export const vendorInvetationDetails = (
  ownerdetails,
  vendorDetails,
  eventDetails
) => {
  const { businessName, email } = vendorDetails;
  const { ownerName, ownerEmail } = ownerdetails;
  const { name, location, type, date } = eventDetails;
  const eventDate = new Date(date);
  const formattedDate = moment(eventDate * 1000)
    .tz("Israel")
    .format("DD-MM-YYYY");

  const subject = `request to hire your services at an event`;
  const text = `Hello ${businessName},\nthe event planner: ${ownerName} is interested in your service for his event.\nHere are the details on the event:\nName: ${name}\nType: ${type}\nLocation: ${location}\nDate: ${formattedDate}\n\nYou can contact the event planner for more info through his email: ${ownerEmail}\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  };
  return mailOptions;
};
// email for vendor that he has been removed from the event.(his service is no longer needed)
export const removeVendorDetails = (
  ownerDetails,
  vendorDetails,
  eventDetails
) => {
  const { businessName, email } = vendorDetails;
  const { ownerName, ownerEmail } = ownerDetails;
  const { name, location, type, date } = eventDetails;
  const eventDate = new Date(date);
  const formattedDate = moment(eventDate * 1000)
    .tz("Israel")
    .format("DD-MM-YYYY");
  const subject = `Cancel Of Service`;
  const text = `Hello ${businessName},\nthe event planner: ${ownerName} is no longer interested in your services for his event and thus removed you.\nHere are some details on the event:\n
  name: ${name}\ntype: ${type}\nlocation: ${location}\ndate: ${formattedDate}\n\nYou can contact the event planner through his email: ${ownerEmail} for more details.\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  };
  return mailOptions;
};
// vendor decided to cancel his service and notify the event owner
export const vendorExitEventDetails = (
  ownerDetails,
  vendorDetails,
  eventDetails
) => {
  const { businessName, email } = vendorDetails;
  const { ownerName, ownerEmail } = ownerDetails;
  const { name, location, type, date } = eventDetails;
  const eventDate = new Date(date);
  const formattedDate = moment(eventDate * 1000)
    .tz("Israel")
    .format("DD-MM-YYYY");
  const subject = `Cancel Of Service`;
  const text = `Hello ${ownerName},\nthe vendor: ${businessName} has decided to cancel, thus will not provide service in your event.\nHere are some details on the event:\nName: ${name}\nType: ${type}\nLocation: ${location}\nDate: ${formattedDate}\n\nYou can contact the vendor through his email: ${email} for more details.\nBest regards, CelebrightEMS Team`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject,
    text,
  };
  return mailOptions;
};
// send the mail function
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
    console.error(err);
    throw new GeneralServerError(
      `unexpected error in sending email ${err.message}`
    );
  }
};
