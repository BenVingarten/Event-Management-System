import { ObjectId } from "mongodb";

export const verifyTaskId = (req, res, next) => {
  if (!req?.params?.taskId)
    return res
      .status(400)
      .json({ error: "event id is missing in the request" });

  const id = req.params.taskId;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: "event id is not valid" });
  next();
};
