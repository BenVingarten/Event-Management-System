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
