import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { getEventByGuestId, getEventById } from "./eventsLogic.js";
import guestModel from "../models/Guest.js";
import eventModel from "../models/Event.js";
export const getGuests = async (userId, eventId) => {
  try {
    const populateOptions = {
      path: "guestList",
      select: "name phoneNumber status peopleCount ",
    };
    const event = await getEventById(userId, eventId, populateOptions);
    return event.guestList;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const addGuest = async (userId, eventId, guestData) => {
  try {
    const event = await getEventById(userId, eventId);
    const { name, phoneNumber, status, peopleCount, group, comments } =
      guestData;
    const duplicatePhoneNumber = await guestModel
      .findOne({ phoneNumber })
      .exec();
    if (duplicatePhoneNumber)
      throw new DuplicateDataError(
        "there is already a guest with that phoneNumber"
      );
    const newGuest = await guestModel.create({
      name,
      peopleCount,
      group,
      phoneNumber,
      status,
      comments,
    });
    event.guestList.push(newGuest);
    await event.save();
    return newGuest;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const getGuestById = async (userId, eventId, guestId) => {
  try {
    await getEventByGuestId(userId, eventId, guestId);
    const guest = await guestModel.findById(guestId);
    if (!guest) throw new DataNotFoundError();
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const patchGuest = async (userId, eventId, guestId, updatedGuest) => {
  try {
    const guest = await getGuestById(userId, eventId, guestId);
    const [key] = Object.keys(updatedGuest);
    const value = updatedGuest[key];
    guest[key] = value;
    await guest.save();
    return guest;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
