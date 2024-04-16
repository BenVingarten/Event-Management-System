export const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.role)
      return res
        .status(401)
        .json({ msg: "Your role has No Access to this resoruce" });
    const rolesArray = [...allowedRoles];
    const result = rolesArray.some((role) => role === req.role);
    if (!result)
      return res
        .status(401)
        .json({ msg: "Your role has No Access to this resoruce" });
    next();
  };
};
