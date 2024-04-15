import bcrypt from "bcrypt";
import userModel from "../model/User.js";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();


 const handleUserLogin = async (request, response) => {
 
    const { body: { username, password } } = request;

    const foundUser = await userModel.findOne({ username }).exec();
    if(!foundUser) return response.status(401).send({ failed: 'incorrect username' }); //unauthorized

    const match = await bcrypt.compare(password, foundUser.password);
    if(match) {
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username":foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '30s'}
        );
        const refreshToken = jwt.sign(
            {"username": foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );

        // save refreshToken to DB
        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        //send access and refresh token to user (client side needs to store the token in memory and not in local storage)
        response.cookie('token', refreshToken, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 }); // secure: true
        response.json({ accessToken });
    } else {
        response.status(401).send({ failed: 'incorrect password' }); //unauthorized
    }
};


export default handleUserLogin;