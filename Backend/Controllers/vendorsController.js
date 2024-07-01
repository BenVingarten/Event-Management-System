import { matchedData, validationResult } from "express-validator";
import {
  getVendors,
  addCustomVendor,
  addRegisteredVendor,
  updateRegisteredVendor,
} from "../services/vendorsLogic.js";

export const handleGetVendors = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    const vendors = await getVendors(userId, eventId);
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
      .json({ msg: `success, added ${newCustomVendor.custom.businessName} to your vendors!` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleAddRegisteredVendor = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId, vendorId } = req.params;
    const newNegotiatedVendor = await addRegisteredVendor(
      userId,
      eventId,
      vendorId
    );
    return res.status(200).json({
      msg: `success, added ${newNegotiatedVendor.businessName} to your  negotiated vendors!`,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleUpdateRegisteredVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });

    const verifiedRegisteredVendor = matchedData(req);
    const { userId } = req;
    const { eventId, vendorId } = req.params;
    const newAddedRegisteredVendor = await updateRegisteredVendor(userId, eventId, vendorId, verifiedRegisteredVendor)
    return res.status(200).json({ success: `updated vendor: ${newAddedRegisteredVendor.businessName} successfully` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
}
