import {
  authenticateUserWithGoogle,
  getUserByEmail,
} from "../services/UserLogic.js";

export const handleUserGoogleLogin = async (req, res) => {
  try {
    if (!req?.body?.email)
      return res.status(400).json({ err: "email is required" });

    const {
      body: { email },
    } = req;

    const tokens = await authenticateUserWithGoogle(email);
    const userFromDataBase = await getUserByEmail(email);

    res.cookie("jwt", tokens[1], {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      userName: userFromDataBase.username,
      role: userFromDataBase.role,
      accessToken: tokens[0],
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
