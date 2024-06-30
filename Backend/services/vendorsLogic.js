import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { getEventById } from "./eventsLogic.js";

export const getVendors = async (userId, eventId, sortBy) => {
  try {
    const options = {
      select: "vendors type location",
      populate: {
        path: "vendors.registeredUser",
        select: "businessName email businessType",
        options: { strictPopulate: false }
      },
      lean: true,
    };
    const event = await getEventById(userId, eventId, options);
    console.log(event);
    const { vendors, type, location } = event;
    const suggestedVendors = await getSuggestedVendors(type, location, sortBy);
    const negotiatedVendors = [];
    const acceptedVendors = [];

    for (const vendor of vendors) {
      const vendorData = vendor.registeredVendor || vendor.custom;
      if (vendor.status === "Accepted") acceptedVendors.push(vendorData);
      else if (vendor.status === "Negotiated")
        negotiatedVendors.push(vendorData);
    }
    const allVendors = {
      suggestedVendors,
      negotiatedVendors,
      acceptedVendors,
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
      select: "vendors",
      populate: { 
        path: "vendors.registeredUser",
        select: "email",
        options: { strictPopulate: false } 
      },
    };
    const event = await getEventById(userId, eventId, options);
    const duplicate = event.vendors.find((vendor) => {
      const vendorData = vendor.registeredUser?  vendor.registeredUser : vendor.custom;
      return vendorData.email === verifiedCustomVendor.email;
    });
    if (duplicate)
      throw new DuplicateDataError("there is already a vendor with that email");
    const newVendor = {
      custom: {
        name: verifiedCustomVendor.name,
        email: verifiedCustomVendor.email,
        businessType: verifiedCustomVendor.businessType,
      },
    };
    newVendor.status = "Added";
    event.vendors.push(newVendor);
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

export const addRegisteredVendor = async (userId, eventId, vendorId) => {
    try {
        const event = await getEventById(userId, eventId);
    } catch(err) {

    }
};

export const getSuggestedVendors = async (type, location, sortBy) => {
  try {
    let sortDirection;
    if (sortBy === "bookedCount") sortDirection = -1;
    else if (sortBy === "avgPrice") sortDirection = 1;
    else sortDirection = 0;

    const pipeLine = [
      {
        $match: {
          role: "Vendor",
          businessLocation: { $in: ["All", location] },
          eventTypes: { $in: ["All", type] },
        },
      },
      {
        $group: {
          _id: "$businessType",
          vendors: {
            $push: {
              businessName: "$businessName",
              email: "$email",
              businessDescription: "$businessDescription",
              bookedCount: "$bookedCount",
              avgPrice: { $avg: ["$minPrice", "$maxPrice"] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          vendors: sortBy
            ? {
                $sortArray: {
                  input: "$vendors",
                  sortBy: { sortBy: sortDirection },
                },
              }
            : "$vendors",
        },
      },
    ];
    const suggestedVendors = await userModel.aggregate(pipeLine);
    console.log(suggestedVendors);
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
