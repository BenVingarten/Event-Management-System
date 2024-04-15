import userModel from "../model/User.js";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();


const handleRefreshToken = async (request, response) => {
    const cookies = request.cookies;
    if(!cookies?.token) return response.sendStatus(401);

    const refreshToken = cookies.token;
   
    const foundUser = await userModel.findOne({ refreshToken }).exec();
    if(!foundUser) return response.sendStatus(403) //forbbiden

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return response.sendStatus(403);
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '30s'}
            );
            response.json({ accessToken });
        }
    );
};

export default handleRefreshToken;
