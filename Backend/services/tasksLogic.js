import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import { getEventById } from "./eventsLogic.js";
import { roundedPercentagesToHundred } from "./eventsLogic.js";
import mongoose from "mongoose";
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
    const event = await getEventById(userId, eventId);
    event.cards = updatedTaskList;
    await event.save();
    return event.cards;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const getTasksAnalytics = async (userId, eventId) => {
  try {
    const pipeLine = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(eventId),
          collaborators: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$cards",
      },
      {
        $facet: {
          countByStatus: [
            {
              $group: {
                _id: "$cards.column",
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                column: "$_id",
                count: 1,
              },
            },
          ],
          countTotal: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
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
    const results = await eventModel.aggregate(pipeLine).exec();
    if (!results)
      throw new DataNotFoundError("No datafound for the provided criteria");
    if(results.length === 0) return results;
    
    const roundedResults = roundedPercentagesToHundred(results);
    return roundedResults;
  } catch (err) {
    console.error("Error in getTasksAnalytics:", err); // Log the detailed error
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
