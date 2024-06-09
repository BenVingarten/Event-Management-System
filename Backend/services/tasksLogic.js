import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import taskModel from "../models/Task.js";
import { getEventById } from "./eventsLogic.js";
import { roundedPercentagesToHundred } from "./eventsLogic.js";
import mongoose from "mongoose";
import suggestedTasksModel from "../models/SuggestedTask.js";
import { eventType } from "../constants/event.js";
export const getTasks = async (userId, eventId) => {
  try {
    const event = await eventModel
      .findOne({ _id: eventId, collaborators: userId })
      .populate({ path: "cards" })
      .exec();
    if (!event) throw new DataNotFoundError();
    return event.cards;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const createTask = async (userId, eventId, taskData, suggested) => {
  try {
    const event = await getEventById(userId, eventId);
    const newTaskObj = taskData;
    newTaskObj.event = event._id;
    const newTask = await taskModel.create(newTaskObj);
    event.cards.push(newTask);
    await event.save();
    return newTask;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const updateTasks = async (userId, eventId, cards) => {
  try {
    const event = await getEventById(userId, eventId);
    for (const card of cards) {
      const task = await taskModel.updateOne(
        { _id: card._id, event: card.event },
        card
      );
      if (!task) throw new DataNotFoundError();
    }
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const getTasksAnalytics = async (userId, eventId) => {
  try {
    const pipeLine = [
      {
        $match: { event: new mongoose.Types.ObjectId(eventId) },
      },
      {
        $facet: {
          countByStatus: [
            { $group: { _id: "$column", count: { $sum: 1 } } },
            { $project: { _id: 0, column: "$_id", count: 1 } },
          ],
          countTotal: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      },
      {
        $unwind: "$countByStatus",
      },
      {
        $unwind: "$countTotal",
      },
      {
        $project: {
          column: "$countByStatus.column",
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$countByStatus.count", "$countTotal.total"] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
    ];
    const event = getEventById(userId, eventId);
    const results = await taskModel.aggregate(pipeLine).exec();
    if (!results)
      throw new DataNotFoundError("No datafound for the provided criteria");
    if (results.length === 0) return results;

    const roundedResults = roundedPercentagesToHundred(results);

    return roundedResults;
  } catch (err) {
    console.error("Error in getTasksAnalytics:", err); // Log the detailed error
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const deleteTask = async (userId, eventId, taskId) => {
  try {
    const event = await eventModel.updateOne(
      { _id: eventId, collaborators: userId },
      { $pull: { cards: taskId } }
    );
    if (!event) throw new DataNotFoundError();
    const result = await taskModel.deleteOne({
      _id: taskId,
      event: eventId,
    });
    if (!result) throw new DataNotFoundError();
  } catch (err) {
    if (err instanceof DataNotFoundError || GeneralServerError) throw err;
    throw new GeneralServerError();
  }
};

export const getSuggestedTasks = async (userId, eventId) => {
  try {
    const event = await getEventById(userId, eventId);
    const { location, type } = event;
    const pipeLine = [
      {
        $match: { eventTypes: type, locations: location },
      },
      {},
      {},
      {},
    ];
    const suggestedTasks = suggestedTasksModel.aggregate(pipeLine);
  } catch (err) {}
};
