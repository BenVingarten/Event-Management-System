import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import { DuplicateUserError } from "../errors/DuplicateUserError.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import jwt from "jsonwebtoken";
import "../config/loadEnv.js";

export const getAllUsers = async (filter, options) => {
  try {
    const users = await userModel.find(filter,options).populate({
      path: "events",
      select: "name date -_id",
    });
    return users;
  } catch (err) {
    throw new GeneralServerError();
  }
};

export const getIdbyEmail = async (email) => {
  try {
    const userId = await userModel.findOne({ email }, "_id");
    console.log(userId);
    if (!userId)
      throw new DataNotFoundError("couldnt find user with that email");
    return userId;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    else throw new GeneralServerError();
  }
};

export const getUserByUsername = async (username) => {
  try {
    const foundUser = await userModel
      .findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } })
      .exec();
    return foundUser;
  } catch (error) {
    throw new GeneralServerError();
  }
};

export const getUserByEmail = async (email) => {
  try {
    const foundUser = await userModel
    .findOne({
      email: {
        $regex: new RegExp("^" + email + "$", "i"),
      },
    })
    .exec();
    return foundUser;
  } catch (error) {
    throw new GeneralServerError();
  }
};

export const issueAccessToken = (user) => {
  try {
    const accessToken = jwt.sign(
      {
        userInfo: {
          id: user._id.toString(),
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
          id: user._id.toString(),
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
    const { username, email, role } = userInfo;
    let { password } = userInfo;

    if (await getUserByUsername(username))
      throw new DuplicateUserError("user with that username already exists");
    if (await getUserByEmail(email))
      throw new DuplicateUserError("user with that email already exists");

    if (password.length === 0) {
      password =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
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
    if (err instanceof DuplicateUserError) throw err;
    else throw new GeneralServerError();
  }
};

export const getUserById = async (id) => {
  try {
    const user = await userModel.findById(id).populate({
      path: "events",
      select: "name date -_id",
    });
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
      const foundUser = await getUserByUsername(updatedValues.username);
      if (foundUser)
        throw new DuplicateUserError(
          "There is already a user with that username"
        );
    }
    if (updatedValues?.email) {
      const foundUser = await getUserByEmail(updatedValues.email);
      if (foundUser)
        throw new DuplicateUserError("There is already a user with that email");
    }

    if (updatedValues?.password) {
      const hasedPwd = await bcrypt.hash(updatedValues.password, 10);
      updatedValues.password = hasedPwd;
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, updatedValues, {
      new: true,
    });

    if (!updatedUser) throw new DataNotFoundError();
    return updatedUser;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateUserError)
      throw err;
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
    if (!isPasswordMatch) throw new UnauthorizedError("incorrect credentials");

    const accessToken = issueAccessToken(findUser);
    const refreshToken = issueRefreshToken(findUser);

    findUser.refreshToken = refreshToken;
    await findUser.save();
    const tokens = { accessToken, refreshToken };
    return tokens;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof UnauthorizedError)
      throw err;
    throw new GeneralServerError();
  }
};

export const authenticateUserWithGoogle = async (email) => {
  try {
    const findUser = await userModel.findOne({ email }).exec();
    if (!findUser) throw new DataNotFoundError();

    const accessToken = issueAccessToken(findUser);
    const refreshToken = issueRefreshToken(findUser);
    findUser.refreshToken = refreshToken;
    await findUser.save();

    const tokens = { accessToken, refreshToken };
    return tokens;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    else throw GeneralServerError();
  }
};

export const assignNewAccessToken = async (refreshToken) => {
  try {
    const findUser = await userModel.findOne({ refreshToken }).exec();
    if (!findUser) throw new DataNotFoundError();
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (decoded && decoded.userInfo.id !== findUser._id.toString())
      throw new UnauthorizedError();

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

export const logoutUser = async (refreshToken) => {
  try {
    const findUser = await userModel.findOne({ refreshToken }).exec();
    if (findUser) {
      findUser.refreshToken = "";
      await findUser.save();
    }
  } catch (err) {
    throw new GeneralServerError();
  }
};

export const deleteUserEvent = async (userId, eventId) => {
  const user = await getUserById(userId);
  user.events.pull(eventId);
  await user.save();
};
