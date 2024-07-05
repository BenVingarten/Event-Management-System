import { createUser } from "../services/UserLogic.js";

export const handleUserGoogleRegister = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ err: "No user information provided" });
    }
    const userInfo = req.body;
    userInfo.password = "";
    // const userInfo = {
    //   username: req.body.username,
    //   email: req.body.email,
    //   password: "",
    //   role: req.body.role,
    // };
    const newUser = await createUser(userInfo);
    return res.status(201).json({
      successfull: `new user ${newUser.username} has been registered with google email!`,
    });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
