import { authenticateUserWithGoogle } from "../services/UserLogic.js";

export const handleUserGoogleLogin = async (req, res) => {
  try {
    if (!req?.body?.email)
      return res.status(400).json({ err: "email is required" });

    const {
      body: { email },
    } = req;

    const tokens = await authenticateUserWithGoogle(email);

    res.cookie("jwt", tokens[1], {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken: tokens[0] });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
