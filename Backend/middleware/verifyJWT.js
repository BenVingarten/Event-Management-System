import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

export const verifyJWT = async (request, response, next) => {
    const authHeader = request.headers.authorization || request.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return response.sendStatus(401); //unauthorized

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return response.sendStatus(403) //forbbiden
            request.user = decoded.UserInfo.username;
            request.roles = decoded.UserInfo.roles;
            next();
        }
    );
}