import { ObjectId } from "mongodb";

export const verifyParamId = (paramName) => (req, res, next) => {
  if (!req?.params[paramName])
    return res
      .status(400)
      .json({ error: `${paramName} id is missing in the request` });

  const id = req.params[paramName];
  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: `${paramName} id is not valid` });
  next();
};
