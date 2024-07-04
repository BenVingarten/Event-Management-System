import { matchedData, validationResult } from "express-validator";
import {
  getVendors,
  addCustomVendor,
  addRegisteredVendor,
  updateRegisteredVendor,
  updateCustomVendor,
  deleteVendor,
  deleteVendorUpcomingEvent,
  getUpcomingEvents,
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
    console.log(req.body);
    const errors = validationResult(req);
    console.log(errors.array());
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
    return res.status(200).json({
      msg: `success, added ${newCustomVendor.custom.businessName} to your vendors!`,
    });
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
    const newAddedRegisteredVendor = await updateRegisteredVendor(
      userId,
      eventId,
      vendorId,
      verifiedRegisteredVendor
    );
    return res.status(200).json({
      success: `updated vendor: ${newAddedRegisteredVendor.businessName} successfully`,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleUpdateCustomVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const verifiedCustomVendor = matchedData(req);
    const { userId } = req;
    const { eventId, vendorEmail } = req.params;
    if (!validator.isEmail(vendorEmail))
      return res.status(400).json({ msg: `invalid email: ${vendorEmail}` });

    const newUpdatedVendor = await updateCustomVendor(
      userId,
      eventId,
      vendorEmail,
      verifiedCustomVendor
    );
    return res.status(200).json(newUpdatedVendor);
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleDeleteVendor = async (req, res) => {
  try {
    console.log(req.body);
    const { userId } = req;
    const { eventId, vendorId } = req.params;
    const { vendor } = req.body;
    if (!vendor)
      return res.status(400).json({ msg: "no vendor specified for deleting" });
    const deletedVendor = await deleteVendor(userId, eventId, vendor);
    return res.status(200).json({
      msg: `success, ${deletedVendor.businessName} has been deleted!`,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleDeleteVendorEvent = async (req, res) => {
  try {
    const { userId } = req;
    const { eventId } = req.params;
    await deleteVendorUpcomingEvent(userId, eventId);
    return res.status(200).json({ smg: "deleted event successfully" });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};

export const handleGetUpcomingEvents = async (req, res) => {
  try {
    const { userId } = req;
    const upcomingEvents = await getUpcomingEvents(userId);
    return res.status(200).json(upcomingEvents);
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
