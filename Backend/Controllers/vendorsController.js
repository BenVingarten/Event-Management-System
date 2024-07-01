import { matchedData, validationResult } from "express-validator";
import {
  getVendors,
  addCustomVendor,
  addRegisteredVendor,
} from "../services/vendorsLogic.js";

export const handleGetVendors = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const vendors = await getVendors(userId, eventId);
    console.log(vendors);
    return res.status(200).json(vendors);
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
    return res
      .status(200)
      .json({ msg: `success, added ${newCustomVendor.name} to your vendors!` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleAddRegisteredVendor = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId, vendorId } = req.params;
    const newCustomVendor = await addRegisteredVendor(
      userId,
      eventId,
      vendorId
    );
    return res
      .status(200)
      .json({
        msg: `success, added ${newCustomVendor.businessName} to your  negotiated vendors!`,
      });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
