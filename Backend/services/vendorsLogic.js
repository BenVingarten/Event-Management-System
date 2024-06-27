import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import eventModel from "../models/Event.js";
import { getEventById } from "./eventsLogic.js";

export const getVendors = async (userId, eventId) => {
    try {
        const vendorsOptions = {
            populate: {path: "registeredVendors", select: "username email businessType" },
            select: "customVendors"
        }
       const event = await getEventById(userId, eventId, vendorsOptions);
       console.log(event);

    } catch (err) {
        if(err instanceof DataNotFoundError) throw err;
        throw new GeneralServerError(`unexpected error getting user's vendors: ${err.message}`);

    }
};
