import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import { DuplicateUsernameError } from "../errors/DuplicateUserError.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import "../config/loadEnv.js";

export const getAllUsers = async (filter, value) => {
  try {
    if (filter && value) {
      let query = {};
      query[filter] = value;
      return await userModel.find(query);
    }
    return await userModel.find({});
  } catch (err) {
    throw new GeneralServerError();
  }
};

export const getUserByUsername = async (username) => {
  const foundUser = await userModel
    .findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } })
    .exec();
  return foundUser;
};

export const getUserByEmail = async (email) => {
  const foundUser = await userModel.findOne({ email }).exec();
  return foundUser;
};

export const issueAccessToken = (user) => {
  try {
    const accessToken = jwt.sign(
      {
        userInfo: {
          id: user._id,
          role: user.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60s" }
    );
    return accessToken;
  } catch (err) {
    throw new GeneralServerError();
  }
};

export const issueRefreshToken = (user) => {
  try {
    const refreshToken = jwt.sign(
      {
        userInfo: {
          id: user._id,
          role: user.role,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    return refreshToken;
  } catch (error) {
    throw new GeneralServerError();
  }
};

export const createUser = async (userInfo) => {
  try {
    const { username, email, password, role } = userInfo;
    if ((await isUsernameExists(username)) || (await isEmailExists(email))) {
      throw new DuplicateUsernameError();
    }

    if (password === "") {
      password = crypto.randomBytes(10).tostring("hex");
    }
    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPwd,
      role,
    });
    return newUser;
  } catch (err) {
    if (err instanceof DuplicateUsernameError) throw err;
    else throw new GeneralServerError();
  }
};

export const getUserById = async (id) => {
  try {
    const user = await userModel.findById(id).exec();
    if (!user) throw new DataNotFoundError("User with that ID is not found");
    return user;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    else throw new GeneralServerError();
  }
};

export const patchUser = async (id, updatedValues) => {
  try {
    if (updatedValues?.username) {
      const foundUser = await userModel
        .findOne({
          username: {
            $regex: new RegExp("^" + updatedValues.username + "$", "i"),
          },
        })
        .exec();
      if (foundUser)
        throw new DuplicateUsernameError(
          "There is already a user with that username"
        );
    }

    if (updatedValues?.email) {
      const foundUser = await userModel.findOne({ email }).exec();
      if (foundUser)
        throw new DuplicateUsernameError(
          "There is already a user with that email"
        );
    }
    const updatedUser = await userModel.findByIdAndUpdate(id, updatedValues);
    if (!updatedUser) throw new DataNotFoundError();
    return updatedUser;
  } catch (err) {
    if ((err.code = 11000)) throw new DuplicateUsernameError();
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const deleteUser = async (id) => {
  try {
    const userToDelete = await userModel.findByIdAndDelete(id);
    if (!userToDelete)
      throw new DataNotFoundError("User with that ID is not found");
    return userToDelete;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError();
  }
};

export const authenticateUser = async (user) => {
  try {
    const { username, password } = user;
    const findUser = await getUserByUsername(username);
    if (!findUser)
      throw new DataNotFoundError("There is no user with that username");

    const isPasswordMatch = await bcrypt.compare(password, findUser.password);
    if (!isPasswordMatch) throw new UnauthorizedError("incorrect password");

    const accessToken = issueAccessToken(findUser);
    const refreshToken = issueRefreshToken(findUser);

    findUser.refreshToken = refreshToken;
    await findUser.save();
    const tokens = [accessToken, refreshToken];

    return tokens;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof UnauthorizedError)
      throw err;
    throw new GeneralServerError();
  }
};

export const assignNewAccessToken = async (refreshToken) => {
  try {
    const findUser = await userModel.findOne({ refreshToken }).exec();
    if (!findUser) throw new DataNotFoundError();

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (decoded.userInfo.id !== findUser._id) throw new UnauthorizedError();

    const accessToken = jwt.sign(
      {
        userInfo: {
          id: decoded.userInfo.id,
          role: decoded.userInfo.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60s" }
    );
    return accessToken;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof UnauthorizedError)
      throw err;
    throw new GeneralServerError();
  }
};
