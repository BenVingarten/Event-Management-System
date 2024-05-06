import { ObjectId } from "mongodb";

export const verifyEventId = (req, res, next) => {
  if (!req?.params?.eventId)
    return res
      .status(400)
      .json({ error: "event id is missing in the request" });

  const id = req.params.eventId;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: "event id is not valid" });
  next();
};
