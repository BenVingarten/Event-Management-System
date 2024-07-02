import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { getUserById } from "./UserLogic.js";
import { removeVendorDetails, vendorInvetationDetails } from "./emailLogic.js";
import { getEventById } from "./eventsLogic.js";

export const getVendors = async (userId, eventId) => {
  try {
    const options = {
      select: "vendors type location",
      populate: {
        path: "vendors.registeredUser",
        select: "businessName email businessType",
        options: { strictPopulate: false },
      },
      lean: true,
    };
    const event = await getEventById(userId, eventId, options);
    const { vendors, type, location } = event;
    const suggestedVendors = await getSuggestedVendors(type, location);
    const negotiatedVendors = [];
    const addedVendors = [];

    for (const vendor of vendors) {
      const vendorData = vendor.registeredUser
        ? vendor.registeredUser
        : vendor.custom;
      if (vendor.status === "Added") addedVendors.push(vendorData);
      else if (vendor.status === "Negotiated")
        negotiatedVendors.push(vendorData);
    }
    const allVendors = {
      suggestedVendors,
      negotiatedVendors,
      addedVendors,
    };
    return allVendors;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error getting user's vendors: ${err.message}`
    );
  }
};

export const addCustomVendor = async (
  userId,
  eventId,
  verifiedCustomVendor
) => {
  try {
    const options = {
      select: "vendors budget",
      populate: {
        path: "vendors.registeredUser",
        select: "email",
        options: { strictPopulate: false },
      },
    };
    const event = await getEventById(userId, eventId, options);
    const duplicate = event.vendors.find((vendor) => {
      const vendorData = vendor.registeredUser
        ? vendor.registeredUser
        : vendor.custom;
      return vendorData.email === verifiedCustomVendor.email;
    });
    if (duplicate)
      throw new DuplicateDataError("there is already a vendor with that email");
    const newVendor = {
      custom: {
        businessName: verifiedCustomVendor.businessName,
        email: verifiedCustomVendor.email,
        businessType: verifiedCustomVendor.businessType,
      },
      priceForService: verifiedCustomVendor.priceForService,
    };
    event.vendors.push(newVendor);
    event.budget -= verifiedCustomVendor.priceForService;
    await event.save();
    return newVendor;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateDataError)
      throw err;
    throw new GeneralServerError(
      `unexpected error in adding a new custom vendor: ${err.message}`
    );
  }
};

export const getSuggestedVendors = async (type, location) => {
  try {
    const pipeLine = [
      {
        $match: {
          role: "Vendor",
          businessLocation: location,
          eventTypes: type,
        },
      },
      {
        $project: {
          _id: 0,
          vendorId: "$_id",
          businessName: "$businessName",
          email: "$email",
          type: "$businessType",
          leadCount: "$leadCount",
        },
      },
      {
        $sort: {
          leadCount: -1,
        },
      },
    ];
    const suggestedVendors = await userModel.aggregate(pipeLine);
    if (!suggestedVendors)
      throw new DataNotFoundError(
        "No suggested vendors matched the event criteria"
      );
    return suggestedVendors;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      "unexpected error in getting suggested Vendors"
    );
  }
};

export const addRegisteredVendor = async (userId, eventId, vendorId) => {
  try {
    const vendorOptions = {
      select: "email businessName",
    };
    const plannerOptions = {
      select: "username email",
    };
    const eventOptions = {
      select: "vendors type location date",
    };
    const vendor = await getUserById(vendorId, vendorOptions); // check for the existence of user with vendorId
    const eventPlanner = await getUserById(userId, plannerOptions);
    const event = await getEventById(userId, eventId, eventOptions);

    const newRegisteredVendor = {
      registeredUser: vendorId,
      status: "Negotiated",
    };
    event.vendors.push(newRegisteredVendor);
    // send email to vendor
    const ownerdetails = {
      ownerName: eventPlanner.username,
      ownerEmail: eventPlanner.email,
    };
    const vendorDetails = {
      businessName: vendor.businessName,
      email: vendor.email,
    };
    const eventDetails = {
      name: event.name,
      location: event.location,
      type: event.type,
      date: event.date,
    };
    const mailOptions = vendorInvetationDetails(
      ownerdetails,
      vendorDetails,
      eventDetails
    );
    await sendWebsiteEmail(mailOptions);
    return newRegisteredVendor;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in adding vendor to negotiated vendors: ${err.message}`
    );
  }
};

export const updateRegisteredVendor = async (
  userId,
  eventId,
  vendorId,
  verifiedVendor
) => {
  try {
    const vendorOptions = {
      select: "upcomingEvents leadCount",
    };
    const eventOptions = {
      select: "vendors budget",
    };
    const vendor = await getUserById(vendorId, vendorOptions); // check for the existence of user with vendorId
    const event = await getEventById(userId, eventId, eventOptions); //check access control

    //update event's budget
    if (verifiedVendor.priceForService) event.budget -= verifiedVendor.price;
    await event.save();

    // update the vendor's price in the array
    const findVendor = event.vendors.find(
      (vendor) => vendor.registeredUser === vendorId
    );
    if (!findVendor)
      throw new DataNotFoundError("couldnt find vendor with that ID");
    findVendor.priceForService = verifiedVendor.priceForService;

    if (verifiedVendor.vendorStatus === "Negotiated") {
      // update the vendor's status first
      findVendor.status = "Added";
      // second we want to add to the vendor the current event
      vendor.upcomingEvents.push(eventId);
      // lastly update the leadcount
      vendor.leadCount++;
      await vendor.save();
    }
    return findVendor;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateDataError)
      throw err;
    throw new GeneralServerError(
      `unexpected error in updating vendor: ${err.message}`
    );
  }
};

export const updateCustomVendor = async (
  userId,
  eventId,
  vendorEmail,
  verifiedCustomVendor
) => {
  try {
    if (
      verifiedCustomVendor.email &&
      verifiedCustomVendor.email === vendorEmail
    )
      // check for duplicate
      throw new DuplicateDataError(
        "there is already a custom vendor with that email"
      );

    const eventOptions = {
      select: "vendors",
    };
    const event = await getEventById(userId, eventId, eventOptions); // check access control
    const findVendor = event.vendors.custom.find(
      (vendor) => vendor.email === vendorEmail
    );
    if (!findVendor)
      throw new DataNotFoundError("there is no vendor with that email");
    for (const key in verifiedCustomVendor)
      findVendor[key] = verifiedCustomVendor[key];

    await event.save();
    return findVendor;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateDataError)
      throw err;
    throw new GeneralServerError(
      `unexpected error in updating Registered vendor: ${err.message}`
    );
  }
};

export const deleteVendor = async (userId, eventId, vendorObj) => {
  try {
    const eventOptions = {
      select: "vendors budget name type location date",
      populate: { path: "owner", select: "username email" },
    };
    const event = await getEventById(userId, eventId, eventOptions);
    event.vendors.pull(vendorObj);
    event.budget += vendorObj.priceForService;
    await event.save();
    // if the vendor is registered we need to remove his event and decrament his lead count

    if (vendorObj.registeredUser) {
      const vendor = await userModel
        .findOneAndUpdate(
          { _id: vendorObj.registeredUser },
          {
            $pull: { upcomingEvents: eventId },
            $inc: { leadCount: -1 },
          }
        )
        .select("email")
        .exec();
      if (!vendor)
        throw new DataNotFoundError("could not find Vendor with that Id");
      //send email to notify the vendor
      const ownerdetails = {
        ownerName: event.owner.username,
        ownerEmail: event.owner.email,
      };
      const vendorDetails = {
        businessName: vendorObj.businessName,
        email: vendor.email,
      };
      const eventDetails = {
        name: event.name,
        location: event.location,
        type: event.type,
        date: event.date,
      };
      const mailOptions = removeVendorDetails(
        ownerdetails,
        vendorDetails,
        eventDetails
      );
      await sendWebsiteEmail(mailOptions);
    }
    return vendorObj;
  } catch (err) {}
};

export const deleteVendorUpcoingEvent = async (userId, eventId) => {
  try {
    const vendor = await userModel
      .updateOne(
        { _id: userId, upcomingEvents: eventId },
        {
          $pull: { upcomingEvents: eventId },
          $inc: { leadCount: -1 },
        }
      )
      .exec();
    if (vendor.matchedCount === 0)
      throw new DataNotFoundError("couldnt find a bendor with that ID");
    const eventOptions = {
      select: "vendors budget name type location date",
      populate: { path: "owner", select: "username email" },
    };
    const event = await getEventById(userId, eventId, eventOptions);
    event.vendors.pull(userId); // remove vendor from the event
    event.budget += vendor.priceForService; // add the price back to the budget
    await event.save();
    //send mail to notify event planner
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting vendor's upcoming event: ${err.message}`
    );
  }
};
