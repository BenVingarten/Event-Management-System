import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import { getUserById } from "./UserLogic.js";
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
    console.log(allVendors);
    return { suggestedVendors, negotiatedVendors, addedVendors };
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
        $group: {
          _id: "$businessType",
          typeVendors: {
            $push: {
              vendorId: "$_id",
              businessName: "$businessName",
              email: "$email",
              businessType: "$businessType",
              leadCount: "$leadCount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          typeVendors: {
            $sortArray: {
              input: "$typeVendors",
              sortBy: { leadCount: -1 },
            },
          },
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
    const options = {
      select: "vendors budget",
      populate: {
        path: "vendors.registeredUser",
        select: "email",
        options: { strictPopulate: false },
      },
    };
    const vendor = await getUserById(vendorId);
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in adding vendor to negotiated vendors: ${err.message}`
    );
  }
};
