import { ObjectId } from "mongodb";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { deleteUserEvent, getIdbyEmail } from "./UserLogic.js";

export const getEvents = async (id) => {
  try {
    const events = await eventModel.find({ collaborators: id });
    if (!events) throw new DataNotFoundError();
    return events;
  } catch (err) {
    throw err;
  }
};
export const createEvent = async (id, event) => {
  try {
    const {
      name,
      date,
      type,
      budget,
      location,
      additionalInfo,
      collaborators,
    } = event;
    const idArray = await getNewCollaboratorsArray(id, collaborators);
    const newEvent = await eventModel.create({
      name,
      date,
      type,
      budget,
      location,
      additionalInfo,
      collaborators: idArray,
    });
    // set event to the user

    await userModel.findByIdAndUpdate(id, {
      $push: { events: newEvent._id },
    });
    return newEvent;
  } catch (err) {
    throw err;
  }
};
export const getEventById = async (userId, eventId, populateOptions = {}) => {
  try {
    const isPopulate =
      populateOptions && Object.keys(populateOptions).length > 0;
    const query = eventModel.findOne({ _id: eventId, collaborators: userId });
    if (isPopulate) query.populate(populateOptions);
    const event = await query.exec();
    if (!event) throw new DataNotFoundError();
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
export const patchEvent = async (userId, eventId, eventDetails) => {
  try {
    const { collaborators, ...otherData } = eventDetails;
    const event = await eventModel.findOneAndUpdate(
      { _id: eventId, collaborators: userId },
      otherData,
      { new: true }
    );
    if (!event) throw new DataNotFoundError();
    const idArray = await getNewCollaboratorsArray(userId, collaborators);
    event.collaborators = idArray;
    await event.save();
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
export const deleteEvent = async (userId, eventId) => {
  try {
    const deletedEvent = await eventModel.findOneAndDelete({
      _id: eventId,
      collaborators: userId,
    });
    await deleteUserEvent(userId, eventId);
    return deletedEvent;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
export const findGuestById = async (userId, eventId, guestId) => {
  try {
    const event = await eventModel
      .findOne({
        _id: eventId,
        collaborators: userId,
        "guestList._id": guestId,
      })
      .select("guestList")
      .exec();
    if (!event || event.guestList.length === 0) throw new DataNotFoundError();
    return event.guestList[0];
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
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
export const getNewCollaboratorsArray = async (userId, collaborators) => {
  try {
    const idSet = new Set();
    idSet.add(userId);
    for (const email of collaborators) {
      const collaboratorId = await getIdbyEmail(email);
      if (collaboratorId) idSet.add(collaboratorId.toString());
    }
    const idArray = Array.from(idSet).map((id) => new ObjectId(id));
    return idArray;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    else throw new GeneralServerError();
  }
};
