import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { getEventById } from "./eventsLogic.js";
export const getGuests = async (userId, eventId) => {
  try {
    const event = await getEventById(userId, eventId);
    return event.guestList;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const addGuest = async (userId, eventId, guestData) => {
  try {
    const event = await getEventById(userId, eventId, guestData);
    const { name, phoneNumber, status } = guestData;
    const duplicatePhoneNumber = await guestModel.findOne({ phoneNumber });
    if (duplicatePhoneNumber) throw new DuplicateDataError("there is already a guest with that phoneNumber");
    const newGuest = await guestModel.create({
      name,
      phoneNumber,
      status,
    });
    event.guestList.push(newGuest);
    await event.save();
    return newGuest;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
