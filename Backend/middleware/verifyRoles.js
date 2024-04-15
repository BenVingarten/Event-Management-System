export const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req?.role)  return res.status(401).json({msg: "Unauthorized"});
        const rolesArray =  [...allowedRoles];
        const result = request.roles.some(role => rolesArray.includes(role));
        if(!result)
            return res.status(401).json({msg: "Unauthorized"});
        next();
    }
}

 