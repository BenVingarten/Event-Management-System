import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import taskModel from "../models/Task.js";
import { getEventById } from "./eventsLogic.js";
import { roundedPercentagesToHundred } from "./eventsLogic.js";
import mongoose from "mongoose";
import suggestedTasksModel from "../models/SuggestedTask.js";
export const getTasks = async (userId, eventId) => {
  try {
    const conditions = [{ owner: userId }, { "collaborators.collaboratorId": userId }];
    const event = await eventModel
      .findOne({ _id: eventId, $or: conditions })
      .populate({ path: "cards" })
      .lean()
      .exec();
    if (!event) throw new DataNotFoundError();
    return event.cards;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting tasks: ${err.message}`
    );
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
    throw new GeneralServerError(
      `unexpected error in creating task: ${err.message}`
    );
  }
};

export const updateTasks = async (userId, eventId, cards) => {
  try {
    const options = {
      select: "cards"
    };
    const event = await getEventById(userId, eventId, options);
    for (const card of cards) {
      const task = await taskModel.updateOne(
        { _id: card._id, event: card.event },
        card
      );
      if (!task) throw new DataNotFoundError();
    }
    event.cards = cards.map(card => card._id);
    await event.save();
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in updating tasks: ${err.message}`
    );
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
    const options = { lean: true };
    await getEventById(userId, eventId, options);
    const results = await taskModel.aggregate(pipeLine).exec();
    if (!results)
      throw new DataNotFoundError("No datafound for the provided criteria");
    if (results.length === 0) return results;

    const roundedResults = roundedPercentagesToHundred(results);

    return roundedResults;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting tasks analytics: ${err.message}`
    );
  }
};

export const deleteTask = async (userId, eventId, taskId) => {
  try {
    const conditions = [{ owner: userId }, { "collaborators.collaboratorId": userId }];
    const event = await eventModel.updateOne(
      { _id: eventId, $or: conditions },
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
    throw new GeneralServerError(
      `unexpected error in deleting task: ${err.message}`
    );
  }
};

export const getSuggestedTasks = async (userId, eventId) => {
  try {
    const options = {
      select: "type",
      lean: true
    }
    const event = await getEventById(userId, eventId, options);
    const { location, type } = event;
    const pipeLine = [
      {
        $match: { eventTypes: type /*, venues: location*/ },
      },
      {
        $group: { _id: "$category", tasks: { $push: "$title" } },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          tasks: 1,
        },
      },
    ];
    const suggestedTasks = suggestedTasksModel.aggregate(pipeLine).exec();
    if (!suggestedTasks)
      throw new DataNotFoundError(
        "No suggested Tasks matched the event criteria"
      );
    return suggestedTasks;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting  suggested tasks: ${err.message}`
    );
  }
};
