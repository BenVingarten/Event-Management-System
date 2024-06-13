import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import { getEventById } from "./eventsLogic.js";
import { roundedPercentagesToHundred } from "./eventsLogic.js";
import eventModel from "../models/Event.js";
import mongoose from "mongoose";
import guestModel from "../models/Guest.js";

export const getGuests = async (userId, eventId) => {
  try {
    const conditions = [
      { owner: userId },
      {"collaborators.id": userId}
    ]
    const event = await eventModel
      .findOne({ _id: eventId, $or: conditions})
      .populate({ path: "guestList" })
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
    const duplicate = event.guestList.find(
      (guest) => guest.phoneNumber === guestData.phoneNumber
    );
    if (duplicate)
      throw new DuplicateDataError(
        "There is already a guest with that phoneNumber"
      );

    const newGuestObj = guestData;
    newGuestObj.event = event._id;

    const newGuest = await guestModel.create(newGuestObj);

    event.guestList.push(newGuest);
    await event.save();

    return newGuest;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateDataError)
      throw err;
    throw new GeneralServerError();
  }
};

export const getGuestById = async (userId, eventId, guestId) => {
  try {
    const event = await getEventById(userId, eventId);
    const guest = await guestModel
      .findOne({ _id: guestId, event: eventId })
      .exec();
    if (!guest) throw new DataNotFoundError();
    return guest;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const patchGuest = async (userId, eventId, guestId, updatedGuest) => {
  try {
    const event = await getEventById(userId, eventId);
    if (updatedGuest.phoneNumber) {
      const duplicate = event.guestList.find(
        (guest) => guest.phoneNumber === updatedGuest.phoneNumber
      );
      if (duplicate)
        throw new DuplicateDataError(
          "There is already a guest with that phoneNumber"
        );
    }
    const guest = await guestModel.findOneAndUpdate(
      { _id: guestId, event: eventId },
      updatedGuest,
      { new: true }
    );
    if (!guest) throw new DataNotFoundError();
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const deleteGuests = async (userId, eventId, selectedGuestsIDs) => {
  try {
    const conditions = [
      { owner: userId },
      {"collaborators.id": userId}
    ]
    const event = await eventModel.updateOne(
      { _id: eventId, $or: conditions },
      { $pull: { guestList: { $in: selectedGuestsIDs } } }
    );
    if (!event) throw new DataNotFoundError();
    const result = await guestModel.deleteMany({
      _id: { $in: selectedGuestsIDs },
      event: eventId,
    });
    if (!result) throw new DataNotFoundError();
    if (result.deletedCount !== selectedGuestsIDs.length)
      throw new GeneralServerError("couldnt delete all users specified");

    return result.deletedCount;
  } catch (err) {
    if (err instanceof DataNotFoundError || GeneralServerError) throw err;
    throw new GeneralServerError();
  }
};

export const getGuestsAnalytics = async (userId, eventId) => {
  try {
    const pipeLine = [
      {
        $match: { event: new mongoose.Types.ObjectId(eventId) }
      },
      {
        $facet: {
          countByStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
          ],
          countTotal: [
            { $group: { _id: null, total: { $sum: 1 } } }
          ]
        }
      },
      {
            $unwind: "$countByStatus",
          },
          {
            $unwind: "$countTotal",
          },
          {
            $project: {
              status: "$countByStatus.status",
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
    const results = await guestModel.aggregate(pipeLine).exec();
    if (!results)
      throw new DataNotFoundError("No datafound for the provided criteria");
    if (results.length === 0) return results;

    const roundedResults = roundedPercentagesToHundred(results);

    return roundedResults;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};
