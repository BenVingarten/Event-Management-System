import { getEventById } from "./eventsLogic.js";
import eventModel from "../models/Event";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { sendCollabMail } from "../constants/email.js";
import InvitesModel from "../models/Invitations.js";
import { addInvite, deleteInvite } from "./invitesLogic.js";
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
    const collabratorsLength = event.collaborators.push(collaborator);
    await event.save();
    await inviteCollaborator(event, collaborator.email);
    return await event.collaborators[collabratorsLength - 1];
  } catch (err) {
    if (
      err instanceof DataNotFoundError ||
      err instanceof DuplicateDataError ||
      err instanceof GeneralServerError
    )
      throw err;
    throw new GeneralServerError("unexpected error adding collaborator");
  }
};

export const inviteCollaborator = async (event, collaboratorEmail) => {
  try {
    const ownerEmail = event.owner.email;
    await sendCollabMail(ownerEmail, collaboratorEmail);
    await addInvite(ownerEmail, event);
  } catch (err) {
    if (err instanceof GeneralServerError) throw err;
    throw new GeneralServerError();
  }
};

export const deleteCollaborator = async (userId, eventId, collaborator) => {
  try {
    // first remove the collaborator from the array
    const removeOptions = {
      $pull: {
        collaborators: collaborator.id ? collaborator.id : collaborator.email,
      },
    };
    const updatedEvent = eventModel
      .findOneAndUpdate(
        {
          _id: eventId,
          owner: userId,
        },
        removeOptions,
        { new: true }
      )
      .exec();
    if (!updatedEvent)
      throw new DataNotFoundError("couldnt find the collaborator");

    await deleteInvite(collaborator.email, eventId);
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError("unexpected error in deleting collaborator");
  }
};
