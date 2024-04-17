import { createUser } from "../services/UserLogic.js";

export const handleUserGoogleRegister = async (req, res) => {
  try {
    if (!req?.body?.username || !req?.body?.email || !req?.body?.role)
      return res.status(400).json({ msg: "some fields are missing" });
    const userInfo = {
      username: req.body.username,
      email: req.body.email,
      password: "",
      role: req.body.role,
    };
    const newUser = await createUser(userInfo);
    return res
      .status(201)
      .json({ successfull: `new user ${newUser.username} created!` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
