import bcrypt from "bcrypt";
import userModel from "../model/User.js";
import { validationResult, matchedData } from "express-validator";

 const handleUserRegister = async (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty())  return response.status(400).send({ errors: errors.array() });

    const { username, email, password } = matchedData(request);

    const duplicate = await userModel.findOne({ $or: [{ username }, { email }] }).exec();
    if(duplicate) return response.status(409).send({ msg: "there is already a user with that username/email" });

    try {
        const hashedPwd = await bcrypt.hash(password, 10);
        await userModel.create({
            username,
            email,
            password: hashedPwd
        });

        response.status(200).send({ success: `new user ${username} created!`});
    } catch (err) {
        response.status(500).send({ msg: err.message});
    }
};

export default handleUserRegister;
