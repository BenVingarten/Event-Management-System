import { ObjectId } from "mongodb";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { deleteUserEvent, getIdbyEmail, getUserById } from "./UserLogic.js";

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
    //set collaborators
    const idSet = new Set();
    idSet.add(id);
    for (const email of collaborators) {
      const collaboratorId = await getIdbyEmail(email);
      if (collaboratorId) {
        idSet.add(collaboratorId.toString());
      }
    }
   

    // Convert the set to an array of ObjectIds
    const idArray = Array.from(idSet).map((id) => new ObjectId(id));

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
    const event = await eventModel.findOneAndUpdate(
      { _id: eventId, collaborators: userId },
      eventDetails,
      { new: true }
    );
    if (!event) throw new DataNotFoundError();
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
        'guestList._id': guestId,
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
