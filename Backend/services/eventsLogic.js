import { ObjectId } from "mongodb";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { deleteUserEvent, getUserWithIdbyEmail } from "./UserLogic.js";
import InvitesModel from "../models/Invitations.js";

export const getEvents = async (id) => {
  try {
    const conditions = [{ owner: id }, { "collaborators.collaboratorId": id }];
    const events = await eventModel.find({ $or: conditions }).exec();
    if (!events) throw new DataNotFoundError();
    return events;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting user's events: ${err.message}`
    );
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
    const user = await userModel.findByIdAndUpdate(id, {
      $push: { events: newEvent._id },
    });
    if (!user) throw new DataNotFoundError("couldnt find user with that id");
    return newEvent;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in creating user's event: ${err.message}`
    );
  }
};
export const getEventById = async (userId, eventId, options = {}) => {
  try {
    const conditions = [
      { owner: userId },
      { "collaborators.collaboratorId": userId },
    ];
    const isPopulate =
      options.populate && Object.keys(options.populate).length > 0;
    const isSelect = options.select !== null;

    const query = eventModel.findOne({ _id: eventId, $or: conditions });

    if (isPopulate) query.populate(options.populate);
    if (isSelect) query.select(options.select);

    const event = await query.exec();
    if (!event) throw new DataNotFoundError();
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting event by Id: ${err.message}`
    );
  }
};
export const patchEvent = async (userId, eventId, eventDetails) => {
  try {
    // find the event and update otherData
    const event = await eventModel
      .findOneAndUpdate({ _id: eventId, owner: userId }, eventDetails, {
        new: true,
      })
      .exec();
    if (!event)
      throw new DataNotFoundError(
        "couldnt find the event or user is not the event owner"
      );
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in updating event's details: ${err.message}`
    );
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
    throw new GeneralServerError(
      `unexpected error in deleting user's event: ${err.message}`
    );
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
