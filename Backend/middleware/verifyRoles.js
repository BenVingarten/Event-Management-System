export const verifyRoles = (...allowedRoles) => {
    return (request, response, next) => {
        if(!request?.roles) return response.sendStauts(401);

        const rolesArray =  [...allowedRoles];
        const result = request.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if(!result) return response.sendStatus(401);
        next();

    }
}

 