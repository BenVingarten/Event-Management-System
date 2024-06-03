import {
  deleteEvent,
  getEventById,
  getEvents,
} from "../services/eventsLogic.js";
import { validationResult, matchedData } from "express-validator";
import { createEvent, patchEvent } from "../services/eventsLogic.js";
import { InvalidFieldModifyError } from "../errors/InvalidFieldModifyError.js";
import { getTasksAnalytics } from "../services/tasksLogic.js";
import { getGuestsAnalytics } from "../services/guestsLogic.js";

export const handleGetEvents = async (req, res) => {
  try {
    const { userId } = req;
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
    const { userId } = req;
    const { eventId } = req.params;
    const populateOptions = { path: "collaborators", select: "username email" };
    const event = await getEventById(userId, eventId, populateOptions);
    const taskAnalytics = await getTasksAnalytics(userId, eventId);
    const guestAnalytics = await getGuestsAnalytics(userId, eventId);
    const eventDetails = {
      event,
      taskAnalytics,
      guestAnalytics,
    };
    return res.status(200).json({ eventDetails });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handlePatchEvent = async (req, res) => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const eventDetails = matchedData(req);
    if (Object.keys(eventDetails).length === 0)
      return res.status(204).json({ msg: "no changes made" });
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
