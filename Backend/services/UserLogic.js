import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import { DuplicateUserError } from "../errors/DuplicateUserError.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
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
    const foundUser = await userModel.findOne({ email }).exec();
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
        throw new DuplicateUserError(
          "There is already a user with that username"
        );
    }

    if (updatedValues?.email) {
      const foundUser = await userModel.findOne({ email }).exec();
      if (foundUser)
        throw new DuplicateUserError("There is already a user with that email");
    }
    const updatedUser = await userModel.findByIdAndUpdate(id, updatedValues);
    if (!updatedUser) throw new DataNotFoundError();
    return updatedUser;
  } catch (err) {
    if ((err.code = 11000)) throw new DuplicateUserError();
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

export const authenticateUserWithGoogle = async (email) => {
  try {
    const findUser = await userModel.findOne({ email }).exec();
    if (!findUser) throw new DataNotFoundError();

    const accessToken = issueAccessToken(findUser);
    const refreshToken = issueRefreshToken(findUser);
    findUser.refreshToken = refreshToken;
    await findUser.save();
    const tokens = [accessToken, refreshToken];
    return tokens;
  } catch (error) {
    if (err instanceof DataNotFoundError) throw err;
    else throw GeneralServerError();
  }
};

export const assignNewAccessToken = async (refreshToken) => {
  try {
    const findUser = await userModel.findOne({ refreshToken }).exec();
    if (!findUser) throw new DataNotFoundError();
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    //console.log(decoded.userInfo.id, findUser._id.toString());
    if (decoded.userInfo.id !== findUser._id.toString()) throw new UnauthorizedError();

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
