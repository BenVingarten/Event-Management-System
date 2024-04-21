import { logoutUser } from "../services/UserLogic.js";

export const handleLogout = async (req, res) => {
  try {
    if (!req?.cookies?.jwt) return res.sendStatus(204); // its ok if there is no refresh token, because we were just about to delete it anyway

    const refreshToken = req.cookies.jwt;
    await logoutUser(refreshToken); // remove the refreh token from db if its in there

    //clean cookie
    res.clearCookie("jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.sendStatus(204);
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
