import { Router } from "express";
import userModel from "../model/User.js";
import { checkSchema, validationResult } from "express-validator";
import { usersQueryValidationSchema } from "../middleware/validateUser.js";


const router = Router();

router.get('/', checkSchema(usersQueryValidationSchema), async (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) return response.send({ errors: errors.array() });

    const { query: { filter, value } } = request;

    const allUsers = await userModel.find({});
    if(filter && value) 
       return response.send(allUsers.filter(user => user[filter] && user[filter].includes(value)));
    return response.send(allUsers);
});

export default router;