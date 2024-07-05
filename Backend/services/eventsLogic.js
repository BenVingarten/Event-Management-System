import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { deleteUserEvent } from "./UserLogic.js";
import taskModel from "../models/Task.js";
import guestModel from "../models/Guest.js";
import { deletingEventlDetails, sendWebsiteEmail } from "./emailLogic.js";
import { collaboratorEventExit } from "./collaboratorsLogic.js";

export const getEvents = async (id) => {
  try {
    const conditions = [{ owner: id }, { "collaborators.collaboratorId": id }];
    const events = await eventModel.find({ $or: conditions }).lean().exec();
    if (!events) throw new DataNotFoundError();
    return events;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting user's events: ${err.message}`
    );
  }
};
export const createEvent = async (id, event) => {
  try {
    const { name, date, type, budget, location, additionalInfo } = event;
    const newEvent = await eventModel.create({
      name,
      date,
      type,
      budget,
      location,
      additionalInfo,
      owner: id,
    });
    const user = await userModel.findByIdAndUpdate(id, {
      $push: { events: newEvent._id },
    });
    if (!user) throw new DataNotFoundError("couldnt find user with that id");
    return newEvent;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in creating user's event: ${err.message}`
    );
  }
};
export const getEventById = async (userId, eventId, options = {}) => {
  try {
    const conditions = [
      { owner: userId },
      { "collaborators.collaboratorId": userId },
    ];
    const isPopulate =
      options.populate && Object.keys(options.populate).length > 0;
    const isSelect = options.select !== null;
    const isLean = options.lean;

    const query = eventModel.findOne({ _id: eventId, $or: conditions });

    if (isPopulate) query.populate(options.populate);
    if (isSelect) query.select(options.select);
    if (isLean) query.lean();

    const event = await query.exec();
    if (!event) throw new DataNotFoundError();
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting event by Id: ${err.message}`
    );
  }
};
export const patchEvent = async (userId, eventId, eventDetails) => {
  try {
    // find the event and update otherData
    const event = await eventModel
      .findOneAndUpdate({ _id: eventId, owner: userId }, eventDetails, {
        new: true,
      })
      .exec();
    if (!event)
      throw new DataNotFoundError(
        "couldnt find the event or user is not the event owner"
      );
    return event;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in updating event's details: ${err.message}`
    );
  }
};
export const deleteEventByOwner = async (userId, eventId) => {
  try {
    // first we want to delete its tasks and guests
    const event = await eventModel
      .findOne({ _id: eventId, owner: userId })
      .select("collaborators name vendors")
      .populate({ path: "owner", select: "username" })
      .exec();
    if (!event)
      throw new DataNotFoundError(
        "couldnot find an event with that ID / user is not owner"
      );

    await taskModel.deleteMany({ event: eventId });
    await guestModel.deleteMany({ event: eventId });

    // Delete the event from all the collaborators:
    for (const collaborator of event.collaborators) {
      await deleteUserEvent(collaborator.collaboratorId, eventId);
      const mailOptions = deletingEventlDetails(
        event.owner.username,
        collaborator.email,
        event.name
      );
      await sendWebsiteEmail(mailOptions);
    }

    // Delete event from vendors upcoming events
    const eventVendors = event.vendors.map((vendor) => vendor.registeredUser);
    for (const vendor of eventVendors) {
      await userModel.findByIdAndUpdate(vendor, {
        $pull: { upcomingEvents: eventId },
        $inc: { leadCount: -1 },
      });

      // Send email to vendor
      const mailOptions = deletingEventlDetails(
        event.owner.username,
        vendor.email,
        event.name
      );
      await sendWebsiteEmail(mailOptions);
    }

    // Delete the event itself:
    const deletedEvent = await eventModel.deleteOne({ _id: eventId });
    if (deletedEvent.deletedCount === 0)
      throw new DataNotFoundError("could not find the event with that ID");
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting user's event: ${err.message}`
    );
  }
};
export const roundedPercentagesToHundred = (results) => {
  // Calculate total percentage to be adjusted
  let totalRoundedPercentage = results.reduce(
    (sum, result) => sum + result.percentage,
    0
  );

  // Adjust the last result to ensure the total percentage sums to 100%
  if (results.length > 0) {
    const lastResultIndex = results.length - 1;
    let difference = 100 - totalRoundedPercentage;
    results[lastResultIndex].percentage += difference;

    // Convert percentages to integers
    results.forEach((result) => {
      result.percentage = Math.round(result.percentage);
    });

    // Verify and adjust if necessary
    totalRoundedPercentage = results.reduce(
      (sum, result) => sum + result.percentage,
      0
    );
    if (totalRoundedPercentage !== 100) {
      const remainingDifference = 100 - totalRoundedPercentage;
      results[lastResultIndex].percentage += remainingDifference;
    }
  }

  return results;
};
export const deleteEvent = async (userId, eventId) => {
  try {
    const eventOptions = {
      select: "owner",
    };
    const event = await getEventById(userId, eventId, eventOptions);
    if (event.owner.toString() === userId) {
      await deleteEventByOwner(userId, eventId);
    } else {
      console.log("here");
      await collaboratorEventExit(userId, eventId);
    }
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting event: ${err.message}`
    );
  }
};
