import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { getEventById } from "./eventsLogic.js";
export const getTasks = async (userId, eventId) => {
    try {
        const event = await getEventById(userId, eventId);
        return event.taskList;
    } catch(err) {
        if(err instanceof DataNotFoundError)
            throw err;
        throw new GeneralServerError();
    }
};

export const updateTasks = async (userId, eventId, updatedTaskList) => {
    try {
        const event = await getEventById(userId, eventId);
        event.taskList = updatedTaskList;
        await event.save();
        return event.taskList;
    } catch (err) {
        if(err instanceof DataNotFoundError)
            throw err;
        throw new GeneralServerError();
    }
};