import validator from "validator";
import { getEventById } from "./eventsLogic.js";
import eventModel from "../models/Event";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { sendCollabMail } from "../constants/email.js";
export const addCollaborator = async (userId, eventId, collaborator) => {
  try {
    const options = {
      populate: { path: "Owner", select: "email" },
      select: "collaborators",
    };
    const event = getEventById(userId, eventId, options);
    const duplicate = event.collaborators.find(
      (email) => email === collaborator.email
    );
    if (duplicate)
      throw new DuplicateDataError(
        "there is already a collaborator with that email"
      );
    event.collaborators.push(collaborator);
    await event.save();
    await inviteCollaborator(event, collaborator.email);
    
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateDataError)
      throw err;
    throw new GeneralServerError("unexpected error adding collaborator");
  }
};

export const inviteCollaborator = async (event, collaboratorEmail) => {
  try {
      const ownerEmail = event.owner.email;
      await sendCollabMail(ownerEmail, collaboratorEmail);
      const newInvite = await InvitesModel.create({
        email: collaboratorEmail,
        event: event._id,
      });
      if (!newInvite)
        throw GeneralServerError("unexpected error creating user invite");
  }
  catch (err) {
    if (err instanceof GeneralServerError) throw err;
    throw new GeneralServerError();
  }
};
