import userModel from "../model/User.js";

const handleLogout = async (request, response) => {
    const cookies = request.cookies;
    if(!cookies?.token) return response.sendStatus(204); // no content

    const refreshToken = cookies.token;

    // we need to clear the cookie anyways
    response.clearCookie('token', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    
    // is refresh token in db
    const foundUser = await userModel.findOne({ refreshToken }).exec();
    if(foundUser) {
        foundUser.refreshToken = "";
        await foundUser.save();
    }
    response.sendStatus(204);
};

export default handleLogout;
