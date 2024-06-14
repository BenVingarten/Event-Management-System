import { ObjectId } from "mongodb";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { deleteUserEvent, getUserWithIdbyEmail } from "./UserLogic.js";
import { sendCollabMail } from "../constants/email.js";
import InvitesModel from "../models/Invitations.js";

export const getEvents = async (id) => {
  try {
    const conditions = [{ owner: id }, { "collaborators.id": id }];
    const events = await eventModel.find({ $or: conditions }).exec();
    if (!events) throw new DataNotFoundError();
    return events;
  } catch (err) {
    throw err;
  }
};
export const createEvent = async (id, event) => {
  try {
    const { name, date, type, budget, location, additionalInfo } = event;
    const newEvent = await eventModel.create({
      name,
      date,
      type,
      budget,
      location,
      additionalInfo,
      owner: id,
    });
    await userModel.findByIdAndUpdate(id, {
      $push: { events: newEvent._id },
    });
    return newEvent;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
export const getEventById = async (userId, eventId, populateOptions = {}) => {
  try {
    const conditions = [{ owner: userId }, { "collaborators.id": userId }];
    const isPopulate =
      populateOptions && Object.keys(populateOptions).length > 0;
    const query = eventModel.findOne({ _id: eventId, $or: conditions });
    if (isPopulate) query.populate(populateOptions);
    const event = await query.exec();
    if (!event) throw new DataNotFoundError();
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    console.error(err);
    throw new GeneralServerError();
  }
};
export const patchEvent = async (userId, eventId, eventDetails) => {
  try {
    const { collaborators, additionalInfo, ...otherData } = eventDetails;
    const event = await eventModel
      .findOneAndUpdate({ _id: eventId, owner: userId }, otherData, {
        new: true,
      })
      .populate({ path: "owner", select: "email" });
    if (!event)
      throw new DataNotFoundError(
        "couldnt find the event or user is not the event owner"
      );
    if (additionalInfo.length !== 0) event.additionalInfo = additionalInfo;
    if (collaborators.length !== 0) {
      const ownerEmail = event.owner.email;
      const eventCollaborators = await inviteCollaborators(
        ownerEmail,
        event,
        collaborators
      );
      event.collaborators = eventCollaborators;
    }
    if (additionalInfo.length !== 0 || collaborators.length !== 0)
      await event.save();
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof GeneralServerError)
      throw err;
    throw new GeneralServerError();
  }
};
export const deleteEvent = async (userId, eventId) => {
  try {
    const deletedEvent = await eventModel.findOneAndDelete({
      _id: eventId,
      owner: userId,
    });
    if (!deletedEvent)
      throw new DataNotFoundError(
        "couldnt find the event or user is not the event owner"
      );
    await deleteUserEvent(userId, eventId);
    return deletedEvent;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError("error in deleting event");
  }
};
export const roundedPercentagesToHundred = (results) => {
  // Calculate total percentage to be adjusted
  let totalRoundedPercentage = results.reduce(
    (sum, result) => sum + result.percentage,
    0
  );

  // Adjust the last result to ensure the total percentage sums to 100%
  if (results.length > 0) {
    const lastResultIndex = results.length - 1;
    let difference = 100 - totalRoundedPercentage;
    results[lastResultIndex].percentage += difference;

    // Convert percentages to integers
    results.forEach((result) => {
      result.percentage = Math.round(result.percentage);
    });

    // Verify and adjust if necessary
    totalRoundedPercentage = results.reduce(
      (sum, result) => sum + result.percentage,
      0
    );
    if (totalRoundedPercentage !== 100) {
      const remainingDifference = 100 - totalRoundedPercentage;
      results[lastResultIndex].percentage += remainingDifference;
    }
  }

  return results;
};
// export const getNewCollaboratorsArray = async (userId, collaborators) => {
//   try {
//   } catch (err) {
//     if (err instanceof DataNotFoundError) throw err;
//     else throw new GeneralServerError();
//   }
// };
export const inviteCollaborators = async (ownerEmail, event, collaborators) => {
  try {
    // prevent duplicates email
    const uniqueCollaborators = [...new Set(collaborators)];
    // send mails and create invatations
    for (const email of uniqueCollaborators) {
      await sendCollabMail(ownerEmail, email);
      const newInvite = await InvitesModel.create({
        email,
        event: event._id,
      });
      if (!newInvite)
        throw GeneralServerError("unexpected error creating user invite");
    }
    // set collaborators to event
    const eventCollaborators = uniqueCollaborators.map((email) => ({
      email,
      status: "Pending",
      
    }));
    return eventCollaborators;
  } catch (err) {
    if (err instanceof GeneralServerError) throw err;
    throw new GeneralServerError();
  }
};
