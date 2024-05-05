import { getEvents } from "../services/eventsLogic.js";
import { validationResult, matchedData } from "express-validator";
import { createEvent } from "../services/eventsLogic.js";

export const handleGetEvents = async (req, res) => {
  try {
    const userId = req.userId;
    const events = await getEvents(userId);
    return res.status(200).json({ events });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleCreateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const eventData = matchedData(req);
    eventData.additionalInfo = req.body.additionalInfo;
    const { userId } = req;
    const newEvent = await createEvent(userId, eventData);
    return res
      .status(201)
      .json({ successfull: `new Event: ${newEvent.name} created!` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
