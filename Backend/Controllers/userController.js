import { InvalidFieldModifyError } from "../errors/InvalidFieldModify.js";
import {
  getAllUsers,
  getUserById,
  patchUser,
  deleteUser,
} from "../services/UserLogic.js";
import { validationResult, matchedData } from "express-validator";

export const handleGetUsers = async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    return res.status(200).json({ allUsers });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handleGetUserById = async (req, res) => {
  try {
    const { userId } = req;
    const user = await getUserById(userId);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const hadnlePatchUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ err: errors.array() });
    const verifiedData = matchedData(req);
    if (Object.keys(verifiedData).length === 0)
      throw new InvalidFieldModifyError();

    const { userId } = req;
    const updatedUser = await patchUser(userId, verifiedData);

    return res.status(200).json({ updatedUser });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
export const handleDeleteUser = async (req, res) => {
  try {
    const { userId } = req;
    const deletedUser = await deleteUser(userId);
    return res
      .status(200)
      .json({ deleted: `${deletedUser.username} deleted successfully` });
  } catch (err) {
    return res.status(err.statusCode).json({ err: err.message });
  }
};
