import { matchedData, validationResult } from "express-validator";
import { getGuests, addGuest } from "../services/guestsLogic.js";

export const handleGetGuests = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const guests = await getGuests(userId, eventId);
    return res.status(200).json({ guests });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleAddGuest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const verifiedData = matchedData(req);
    const { userId } = req;
    const { eventId } = req.params;
    const newGuest = await addGuest(userId, eventId, verifiedData);
    return res.json(201).json({ newGuest });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleGetGuest = async (req, res) => {

};
export const handlePatchGuest = async (req, res) => {

};
export const handlePutGuest = async (req, res) => {

};
export const handleDeleteGuest = async (req, res) => {

};



