import { getEventById } from "./eventsLogic.js";
import eventModel from "../models/Event.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { sendCollabMail } from "../constants/email.js";
import { addInvite, deleteInvite } from "./invitesLogic.js";
import {
  deleteUserEvent,
} from "./UserLogic.js";
export const addCollaborator = async (userId, eventId, collaborator) => {
  try {
    const options = {
      populate: { path: "owner", select: "email" },
      select: "collaborators",
    };
    const event = await getEventById(userId, eventId, options);
    const duplicate = event.collaborators.find(
      (collaboratorObj) => collaboratorObj.email === collaborator.email
    );
    if (duplicate) {
      throw new DuplicateDataError(
        "there is already a collaborator with that email"
      );
    }
    const collabratorsLength = event.collaborators.push(collaborator);
    await event.save();
    await inviteCollaborator(event, collaborator.email);
    return event.collaborators[collabratorsLength - 1];
  } catch (err) {
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
    await addInvite(collaboratorEmail, event);
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
    const filter = collaborator.collaboratorId
      ? { collaboratorId: collaborator.collaboratorId }
      : { email: collaborator.email };
    const removeOptions = { $pull: { collaborators: filter } };
    const result = await eventModel.updateOne(
      {
        _id: eventId,
        owner: userId,
      },
      removeOptions
    );
    if (result.modifiedCount === 0) {
      throw new DataNotFoundError("couldn't find the collaborator");
    }
    // now we want to remove the event from the collaborator events if exists there
    if (collaborator.status === "Active")
      await deleteUserEvent(collaborator.collaboratorId, eventId);
    // delete the invite for collaboration if exists
    await deleteInvite(collaborator.email, eventId);
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting collaborator: ${err.message}`
    );
  }
};
