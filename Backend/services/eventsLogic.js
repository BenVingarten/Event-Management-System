import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { deleteUserEvent } from "./UserLogic.js";
import taskModel from "../models/Task.js";
import guestModel from "../models/Guest.js";
import { deletingEventlDetails, sendWebsiteEmail } from "./emailLogic.js";
import { collaboratorEventExit } from "./collaboratorsLogic.js";
import { deleteInvite } from "./invitesLogic.js";

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
      if (collaborator.collaboratorId) {
        await deleteUserEvent(collaborator.collaboratorId, eventId);

        const mailOptions = deletingEventlDetails(
          event.owner.username,
          collaborator.email,
          event.name
        );
        await sendWebsiteEmail(mailOptions);
      } else {
        // Delete event invites to the collaborator
        if (collaborator.status === "Pending") {
          await deleteInvite(collaborator.email, eventId);
        }
      }
    }

    // Delete event from vendors upcoming events
    for (const vendor of event.vendors) {
      if (vendor.registeredUser) {
        const user = await userModel
          .findById(vendor.registeredUser)
          .select("upcomingEvents leadCount email");

        if (!user) throw new DataNotFoundError("could not find the user");

        user.upcomingEvents.pull(eventId);
        user.leadCount--;
        await user.save();

        // Send email to vendor
        const mailOptions = deletingEventlDetails(
          event.owner.username,
          user.email,
          event.name
        );
        await sendWebsiteEmail(mailOptions);
      }
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
      await collaboratorEventExit(userId, eventId);
    }
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting event: ${err.message}`
    );
  }
};

export const removeVendorFromVendorsArrayByPlanner = async(userId, eventId, vendorObj) => {
  try {
    const eventOptions = {
      select: "vendors budget name type location date",
      populate: { path: "owner", select: "username email" },
    };
    const event = await getEventById(userId, eventId, eventOptions);
    // Find the specific vendor object in the vendors array
    const findVendor = event.vendors.find(ven => 
    (ven.registeredUser && (ven.registeredUser).toString() === vendorObj._id) ||
    (ven.custom && ven.custom.email === vendorObj.email)); 
  
    if (!findVendor) {
      throw new DataNotFoundError("Could not find a vendor with that ID in the event");
    }
    // Remove the vendor object from the vendors array
    event.vendors.pull(findVendor);
    if(findVendor.status === "Added")
      event.budget += vendorObj.priceForService;
    await event.save();
    return event;
  } catch(err) {
    if(err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(`unexpected error in removing vendor from the event: ${err.message}`);
  }
};
export const removeVendorFromVendorsArrayByVendor = async(vendorId, eventId) => {
  try {
   const event = await eventModel
   .findById(eventId)
   .select("vendors budget name type location date")
   .populate({ path: "owner", select: "username email" })
   if(!event) throw new DataNotFoundError("could not find an event with that ID");

   const vendorObj = event.vendors.find((ven) => 
    ven.registeredUser && ven.registeredUser.toString() === vendorId);
   if(!vendorObj) throw new DataNotFoundError("could not find a vendor with that Id");

   event.vendors.pull(vendorObj);
   if(vendorObj.status === "Added")
      event.budget += vendorObj.priceForService;

   await event.save();
   return event;
  } catch(err) {
    if(err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(`unexpected error in removing vendor from the event: ${err.message}`);
  }
};
