import { validationResult } from "express-validator";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { getEventById } from "./eventsLogic.js";
import taskModel from "../models/Task.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";

export const createTask = async (userId, eventId, taskData) => {
   try {
       const newTask = await taskModel.create(taskData);
       const event = await getEventById(userId, eventId);
       event.taskList.push(newTask);
       await event.save();
       return newTask;
   } catch(err) {
        if(err instanceof DataNotFoundError) throw err;
        throw new GeneralServerError();
   }
}