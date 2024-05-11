import {
  deleteEvent,
  getEventById,
  getEvents,
} from "../services/eventsLogic.js";
import { validationResult, matchedData } from "express-validator";
import { createEvent, patchEvent } from "../services/eventsLogic.js";
import { InvalidFieldModifyError } from "../errors/InvalidFieldModify.js";

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

export const handleGetEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req;
    const event = await getEventById(userId, eventId);
    return res.status(200).json({ event });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handlePatchEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const eventDetails = matchedData(req);
    if(Object.keys(eventDetails).length === 0 )
        throw new InvalidFieldModifyError();
      
    const { eventId } = req.params;
    const { userId } = req;
    const event = await patchEvent(userId, eventId, eventDetails);
    return res.status(200).json({ event });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleDeleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req;
    const event = await deleteEvent(userId, eventId);
    return res
      .status(200)
      .json({ deleted: `you successfully deleted the event: ${event.name}` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
