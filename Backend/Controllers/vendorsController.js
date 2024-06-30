import { matchedData, validationResult } from "express-validator";
import { getVendors } from "../services/vendorsLogic.js";

export const handleGetVendors = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const vendors = await getVendors(userId, eventId);
    return res.status(200).json({ vendors });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleAddCustomVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });

    const verifiedCustomVendor = matchedData(req);
    const { userId } = req;
    const { eventId } = req.params;
    const newCustomVendor = await addCustomVendor(
      userId,
      eventId,
      verifiedCustomVendor
    );
    return res.status(200).json({ newCustomVendor });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
