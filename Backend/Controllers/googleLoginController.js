import { authenticateUserWithGoogle } from "../services/UserLogic.js";

export const handleUserGoogleLogin = async (req, res) => {
  try {
    if (!req?.body?.email)
      return res.status(400).json({ msg: "email is required" });

    const {
      body: { email },
    } = req;

    const tokens = await authenticateUserWithGoogle(email);

    res.cookie("jwt", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode).json({ err: err.message });
  }
};
