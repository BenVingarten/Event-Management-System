export const verifyUserIdMatchAuthId = (req, res, next) => {
  if (!req?.userId || req.params.id !== req.userId) {
    return res
      .status(401)
      .json({ msg: "you dont have an access to this resource" });
  }
  next();
};