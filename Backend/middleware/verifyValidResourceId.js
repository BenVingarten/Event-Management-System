import { ObjectId } from "mongodb";

export const verifyValidResourceId = (req, res, next) => {
  if (!req?.params?.id)
    return res.status(400).json({ error: "user id is missing in the request" });

  const id = req.params.id;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: "user id is not valid" });
  next();
};
