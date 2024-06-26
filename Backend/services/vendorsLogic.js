import { DataNotFoundError } from "../errors/DataNotFoundError";
import { GeneralServerError } from "../errors/GeneralServerError";
import { getEventById } from "./eventsLogic";

export const getVendors = async (userId, eventId) => {
    try {

        vendorsOptions = {
            populate: {},
            select: {}
        }
        const event = getEventById(userId, eventId, vendorsOptions)
    } catch (err) {
        if(err instanceof DataNotFoundError) throw err;
        throw new GeneralServerError(`unexpected error getting user's vendors: ${err.message}`);

    }
};
