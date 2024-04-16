
export const verifyAccessToResource = (req, res, next) => {
  if (!req?.params?.id || !req?.userId || req.params.id !== req.userId) {
    return res
      .status(401)
      .json({ msg: "you dont have an access to this resource" });
  }
  next();
};
