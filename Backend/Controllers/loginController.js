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

    // Liad Changes -- this gets the role of the user
    const userFromDataBase = await getUserByUsername(username);
    //console.log("Role: ", userFromDataBase.role);

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
