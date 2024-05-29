import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { findGuestById, getEventById } from "./eventsLogic.js";
import { roundedPercentagesToHundred } from "./eventsLogic.js";
import eventModel from "../models/Event.js";

export const getGuests = async (userId, eventId) => {
  try {
    const event = await eventModel
      .findOne({ _id: eventId, collaborators: userId })
      .select("guestList")
      .exec();
    if (!event) throw new DataNotFoundError();
    return event.guestList;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const addGuest = async (userId, eventId, guestData) => {
  try {
    const event = await getEventById(userId, eventId);
    const existingPhone = event.guestList.find(
      (guest) => guest.phoneNumber === guestData.phoneNumber
    );
    if (existingPhone)
      throw new DuplicateDataError(
        "there is already a guest with that phoneNumber"
      );
    event.guestList.push(guestData);
    await event.save();
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateDataError)
      throw err;
    throw new GeneralServerError();
  }
};

export const getGuestById = async (userId, eventId, guestId) => {
  try {
    const guest = await findGuestById(userId, eventId, guestId);
    return guest;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const patchGuest = async (userId, eventId, guestId, updatedGuest) => {
  try {
    const event = await eventModel
      .findOne({
        _id: eventId,
        collaborators: userId,
      })
      .select("guestList");
    const guest = event.guestList.find(
      (guest) => guest._id.toString() === guestId
    );
    if (!guest)
      throw new DataNotFoundError(
        "there is no guest with that id in the guestList of the event"
      );
    for (const key in updatedGuest) guest[key] = updatedGuest[key];
    await event.save();
    return guest;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const deleteGuests = async (userId, eventId, selectedGuestsIDs) => {
  try {
    const event = await eventModel.updateOne(
      { _id: eventId, collaborators: userId },
      { $pull: { guestList: { _id: { $in: selectedGuestsIDs } } } }
    );
    if (!event) throw new DataNotFoundError();
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
        $unwind: "$guestList"
      },
     {
       $facet: {
         countByStatus: [
          {
            $group: {
              _id: "$guestList.status",
              count: {$sum : 1}
            }
          },
          {
            $project: {
              _id: 0,
              status: "$_id",
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
          status: "$countByStatus.status",
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

