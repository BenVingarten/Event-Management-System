import { matchedData, validationResult } from "express-validator";
import { getGuests, addGuest } from "../services/guestsLogic.js";
import {
  getGuestById,
  patchGuest,
  deleteGuests,
} from "../services/guestsLogic.js";
export const handleGetGuests = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const guestList = await getGuests(userId, eventId);
    return res.status(200).json({ guestList });
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
    console.log(verifiedData);
    const { userId } = req;
    const { eventId } = req.params;
    const newGuest = await addGuest(userId, eventId, verifiedData);
    return res.status(201).json({
      success: `new guest ${newGuest.name} has been added to the guestList`,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleGetGuest = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId, guestId } = req.params;
    const guest = await getGuestById(userId, eventId, guestId);
    return res.status(200).json({ guest });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handlePatchGuest = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId, guestId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const verifiedUpdatedGuest = matchedData(req);
    const updatedGuest = await patchGuest(
      userId,
      eventId,
      guestId,
      verifiedUpdatedGuest
    );
    return res.status(200).json({ updatedGuest });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handlePutGuest = async (req, res) => {};
export const handleDeleteGuests = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const { idArray } = req.body;
    const deletedGuests = await deleteGuests(userId, eventId, idArray);

    return res.status(200).json({ success: `deleted guests successfully` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
