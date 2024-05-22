import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { deleteUserEvent, getIdbyEmail, getUserById } from "./UserLogic.js";

export const getEvents = async (id) => {
  try {
    const populateOptions = {
      path: "events",
      select: "name date type budget location collaborators",
    };
    const user = await getUserById(id, populateOptions);
    return user.events;
  } catch (err) {
    throw err;
  }
};
export const createEvent = async (id, event) => {
  try {
    const user = await userModel.findById(id);
    if (!user) throw new DataNotFoundError();
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
    const idArray = [id];
    //TODO: change email validate to ignore uppercase and lowercase
    for (const email of collaborators) {
      const collaboratorId = await getIdbyEmail(email);
      idArray.push(collaboratorId);
    }
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
    user.events.push(newEvent);
    await user.save();
    //TODO: set event to collaborators only after they accept
    return newEvent;
  } catch (err) {
    throw err;
  }
};
export const getEventById = async (userId, eventId, populateOptions) => {
  try {
    const event = await eventModel
      .findOne({ _id: eventId, collaborators: userId })
      .exec();
    if (!event) throw new DataNotFoundError();
    if (populateOptions && Object.keys(populateOptions).length > 0)
      event.populate(populateOptions);
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
export const patchEvent = async (userId, eventId, eventDetails) => {
  try {
    const event = await getEventById(userId, eventId);
    for (let property in eventDetails) event[property] = eventDetails[property];
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
export const getEventByGuestId = async (userId, eventId, guestId) => {
  try {
    const event = await eventModel
      .findOne({ _id: eventId, collaborators: userId, guestList: guestId })
      .exec();
    if (!event) throw new DataNotFoundError();
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
