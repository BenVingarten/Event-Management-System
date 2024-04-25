export const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.role) return res.status(401).json({ msg: "No role provided!" });

    const rolesArray = [...allowedRoles];
    const result = rolesArray.some((role) => {
      return role === req.role;
    });
    
    if (!result)
      return res
        .status(401)
        .json({ msg: "Your role has No Access to this resoruce" });
    next();
  };
};
