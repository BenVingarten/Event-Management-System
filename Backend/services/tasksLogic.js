import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { getEventById } from "./eventsLogic.js";
export const getTasks = async (userId, eventId) => {
  try {
    const event = await getEventById(userId, eventId);
    return event.cards;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const updateTasks = async (userId, eventId, updatedTaskList) => {
  try {
    console.log(updatedTaskList);
    const event = await getEventById(userId, eventId);
    updatedTaskList = updatedTaskList.map(
      (card) => (card.id = parseInt(card.id))
    );
    event.cards = updatedTaskList;
    await event.save();
    return event.cards;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
