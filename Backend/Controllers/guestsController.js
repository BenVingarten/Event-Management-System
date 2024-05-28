import { matchedData, validationResult } from "express-validator";
import { getGuests, addGuest } from "../services/guestsLogic.js";
import {
  getGuestById,
  patchGuest,
  deleteGuests,
} from "../services/guestsLogic.js";
import { InvalidFieldModifyError } from "../errors/InvalidFieldModifyError.js";
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
    if (req.body.comments) verifiedData.comments = req.body.comments;
    const { userId } = req;
    const { eventId } = req.params;
    await addGuest(userId, eventId, verifiedData);
    return res.status(201).json({
      success: `new guest has been added to the guestList`,
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
    if (Object.keys(verifiedUpdatedGuest).length === 0)
      throw new InvalidFieldModifyError();
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
    const { selectedGuestsIDs } = req.body;
    console.log(selectedGuestsIDs);
    await deleteGuests(userId, eventId, selectedGuestsIDs);
    return res.status(200).json({ success: `deleted guests successfully` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
