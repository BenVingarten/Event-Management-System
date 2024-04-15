import { createUser } from "../services/UserLogic.js";
import { matchedData, validationResult } from "express-validator";

export const handleRegister = async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({error: errors.array()});
        const userInfo = matchedData(req);

        const newUser = await createUser(userInfo.username, userInfo.password);
            return res.status(201).json({successfull: `new user ${newUser.username} created!`});
    } catch(err) {
        return res.status(err.statusCode).json({err: err.message});
    }
   
}