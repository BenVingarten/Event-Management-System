import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import { getEventById } from "./eventsLogic.js";

export const getVendors = async (userId, eventId) => {
    try {
        const options = {
            select: "vendors",
            populate: { path: "registeredUser", select: "businessName email businessType" },
            lean: true
        }
        const event = getEventById(userId, eventId, options);
        const { vendors } = event;
        const suggestedVendors = await getSuggestedVendors(userId, eventId);
        const negotiatedVendors = [];
        const acceptedVendors = [];

        for(const vendor of vendors) {
            const vendorData = vendor.registeredVendor || vendor.custom;
            if(vendor.status === "Accepted") acceptedVendors.push(vendorData);
            else if(vendor.status === "Negotiated") negotiatedVendors.push(vendorData);
        }
        const allVendors = {
            suggestedVendors,
            negotiatedVendors,
            acceptedVendors
        };
       return allVendors;
    } catch (err) {
        if(err instanceof DataNotFoundError) throw err;
        throw new GeneralServerError(`unexpected error getting user's vendors: ${err.message}`);

    }
};

export const addCustomVendor = async (userId, eventId, verifiedCustomVendor) => {
    try {
        const options = {
            select: "vendors",
            populate: { path: "registeredUser", select: "email" }
        };
        const event = getEventById(userId, eventId, options);
        const duplicate = event.vendors.find(vendor => {
            const vendorData = vendor.registeredUser || vendor.custom;
            return vendorData.email === verifiedCustomVendor.email;
        });
        if(duplicate) throw new DuplicateDataError("there is already a vendor with that email");
        const newVendor = {
            custom: {
                name: verifiedCustomVendor.name,
                email: verifiedCustomVendor.email,
                businessType: verifiedCustomVendor.businessType
            }
        };
        event.vendors.push(newVendor);
        await event.save();
        return newVendor;
    } catch (err) {
        if(err instanceof DataNotFoundError || err instanceof DuplicateDataError) throw err;
        throw new GeneralServerError(`unexpected error in adding a new custom vendor: ${err.message}`);
    }
};

export const getSuggestedVendors = async (userId, eventId) => {
    try {

    } catch(err) {

    }
};
