import { getEventById } from "./eventsLogic.js";
import eventModel from "../models/Event.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { sendCollabMail } from "../constants/email.js";
import { addInvite, deleteInvite } from "./invitesLogic.js";
import { deleteUserEvent } from "./UserLogic.js";
export const addCollaborator = async (userId, eventId, collaborator) => {
  try {
    const options = {
      populate: { path: "owner", select: "email" },
      select: "collaborators",
    };
    const event = await getEventById(userId, eventId, options);
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
    return event.collaborators[collabratorsLength - 1];
  } catch (err) {
    console.error(err);
    if (
      err instanceof DataNotFoundError ||
      err instanceof DuplicateDataError ||
      err instanceof GeneralServerError
    )
      throw err;
    throw new GeneralServerError(
      `unexpected error in adding collaborator: ${err.message}`
    );
  }
};

export const inviteCollaborator = async (event, collaboratorEmail) => {
  try {
    const ownerEmail = event.owner.email;
    await sendCollabMail(ownerEmail, collaboratorEmail);
    await addInvite(ownerEmail, event);
  } catch (err) {
    if (err instanceof GeneralServerError) throw err;
    throw new GeneralServerError(
      `unexpected error in inviting collaborator: ${err.message}`
    );
  }
};

export const deleteCollaborator = async (userId, eventId, collaborator) => {
  try {
    // first remove the collaborator from the collavorators array
    const removeOptions = {
      $pull: {
        collaborators: collaborator.collaboratorId
          ? collaborator.collaboratorId
          : collaborator.email,
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
    // now we want to remove the event from the user events if exists there
    await deleteUserEvent(userId, eventId);
    // delete the invite for collaboration if exists
    await deleteInvite(collaborator.email, eventId);
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting collaborator: ${err.message}`
    );
  }
};
