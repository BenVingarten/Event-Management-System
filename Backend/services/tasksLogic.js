import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import { getEventById } from "./eventsLogic.js";
import { roundedPercentagesToHundred } from "./eventsLogic.js";
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
          _id: mongoose.Types.ObjectId(eventId),
          collaborators: mongoose.Types.ObjectId(userId)
        }
      },
      {
        $unwind: "$cards"
      },
     {
       $facet: {
         countByStatus: [
          {
            $group: {
              _id: "$cards.column",
              count: {$sum : 1}
            }
          },
          {
            $project: {
              _id: 0,
              column: "$_id",
              count: 1
            }
          }
        ],
        countTotal: [
          {
            $group: {
              _id: null,
              total: {$sum : 1}
            }
          }
        ]
       }
     },
     {
        $unwind: "$countByStatus"
     },
     {
        $unwind: "$countTotal"
     },
      {
        $project: {
          column: "$countByStatus.column",
          rawPercentage: {
            $round: [
              {$multiply: [{ $divide: ["$countByStatus.count", "$countTotal.total" ] }, 100]}, 1
            ]
                 
          }
        }
      }
    ]
    const results = await eventModel.aggregate(pipeLine).toArray();
    if(!results || results.length === 0)
      throw new DataNotFoundError("No datafound for the provided criteria");

    const roundedResults = roundedPercentagesToHundred(results);
    console.log(roundedResults);
    return roundedResults;
  } catch(err) {
    if(err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
    
}
