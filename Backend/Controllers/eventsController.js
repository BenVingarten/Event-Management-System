import { getEvents } from "../services/eventsLogic.js";

export const handleGetEvents = async (req, res) => {
    try {
        const userId = req.userId;
        const events = await getEvents(userId);
        return res.status(200).json({events});
    } catch(err) {
        return res.status(err.statusCode).json({err: err.message});
    }
}