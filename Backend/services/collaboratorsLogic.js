import { getEventById } from "./eventsLogic.js";
import eventModel from "../models/Event.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import {
  sendWebsiteEmail,
  collabAddingInvitationDetails,
  collabRemovalDetails,
  collabExitEventDetails,
} from "../services/emailLogic.js";
import { addInvite, deleteInvite } from "./invitesLogic.js";
import { deleteUserEvent } from "./UserLogic.js";
import userModel from "../models/User.js";
export const addCollaborator = async (userId, eventId, collaborator) => {
  try {
    const options = {
      populate: { path: "owner", select: "username" },
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
    const mailOptions = collabAddingInvitationDetails(
      event.owner.username,
      collaboratorEmail
    );
    await sendWebsiteEmail(mailOptions);
    await addInvite(collaboratorEmail, event);
  } catch (err) {
    console.error(err);
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
    const event = await eventModel
      .findOneAndUpdate(
        {
          _id: eventId,
          owner: userId,
        },
        removeOptions
      )
      .populate({ path: "owner", select: "username" })
      .select("name")
      .exec();

    if (!event) {
      throw new DataNotFoundError("couldn't find the collaborator");
    }
    // now we want to remove the event from the collaborator events if exists there
    if (collaborator.status === "Active") {
      await deleteUserEvent(collaborator.collaboratorId, eventId);
      const mailOptions = collabRemovalDetails(
        event.owner.username,
        collaborator.email,
        event.name
      );
      await sendWebsiteEmail(mailOptions);
    }
    // delete the invite for collaboration if exists
    await deleteInvite(collaborator.email, eventId);
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof GeneralServerError)
      throw err;
    throw new GeneralServerError(
      `unexpected error in deleting collaborator: ${err.message}`
    );
  }
};

export const collaboratorEventExit = async (userId, eventId) => {
  try {
    //first remove the event from the events array
    const collaborator = await userModel
      .findOneAndUpdate({ _id: userId }, { $pull: { events: eventId } })
      .select("username email")
      .exec();
    if (!collaborator)
      throw new DataNotFoundError("couldnt find a user with that ID");

    // second remove the collaborator from the collavorators array
    const event = await eventModel
      .findOneAndUpdate(
        {
          _id: eventId,
          "collaborators.collaboratorId": userId,
        },
        { $pull: { collaborators: { collaboratorId: userId } } }
      )
      .select("name")
      .populate({ path: "owner", select: "username email" })
      .exec();
    if (!eventId)
      throw new DataNotFoundError("couldnt find an event with that ID");

    const ownerDetails = {
      ownerName: event.owner.username,
      ownerEmail: event.owner.email,
    };
    const collaboratorDetails = {
      collabName: collaborator.username,
      collabEmail: collaborator.email,
    };
    const mailOptions = collabExitEventDetails(
      ownerDetails,
      collaboratorDetails,
      event.name
    );
    await sendWebsiteEmail(mailOptions);
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting collaborator: ${err.message}`
    );
  }
};
