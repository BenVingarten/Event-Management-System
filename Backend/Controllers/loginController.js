import { authenticateUser, getUserByUsername } from "../services/UserLogic.js";

export const handleUserLogin = async (req, res) => {
  try {
    if (!req?.body?.username || !req?.body?.password)
      return res
        .status(400)
        .json({ err: "username and password are required" });
    const {
      body: { username, password },
    } = req;

    const user = { username, password };
    const tokens = await authenticateUser(user);
    const userData = await getUserByUsername(username);
    const email = userData.email;

    res.cookie("jwt", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      accessToken: tokens.accessToken,
      userName: username,
      email: email,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
