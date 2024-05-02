import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import userModel from "../models/User.js";

export const getEvents = async (id) => {
    try {
        const findUser = await userModel.findById(id);
        if(!findUser)
            throw new DataNotFoundError();
        const events = findUser.events;
        return events;
    } catch(err) {
        if(err instanceof DataNotFoundError) throw err;
        else throw new GeneralServerError();
    }
};