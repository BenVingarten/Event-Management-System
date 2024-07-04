import userModel from "../models/User.js";
import vendorModel from "../models/Vendor.js";
import bcrypt from "bcrypt";
import { DuplicateDataError } from "../errors/DuplicateDataError.js";
import { DataNotFoundError } from "../errors/DataNotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { GeneralServerError } from "../errors/GeneralServerError.js";
import jwt from "jsonwebtoken";
import "../config/loadEnv.js";

export const getAllUsers = async () => {
  try {
    const users = await userModel.find({});
    return users;
  } catch (err) {
    throw new GeneralServerError(
      `unexpected error in getting users: ${err.message}`
    );
  }
};

export const getUserWithIdbyEmail = async (email) => {
  try {
    const user = await userModel.findOne({ email }).select("_id").exec();
    return user;
  } catch (err) {
    throw new GeneralServerError(
      `unexpected error in getting user with that email: ${err.message}`
    );
  }
};

export const getUserByUsername = async (username) => {
  try {
    const foundUser = await userModel
      .findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } })
      .exec();
    return foundUser;
  } catch (error) {
    throw new GeneralServerError(
      `unexpected error in getting user by username: ${err.message}`
    );
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
    throw new GeneralServerError(
      `unexpected error in getting user with that email: ${err.message}`
    );
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
    throw new GeneralServerError(
      `unexpected error in issuing access token for the user: ${err.message}`
    );
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
    throw new GeneralServerError(
      `unexpected error in issuing refresh token for the user: ${err.message}`
    );
  }
};

export const createUser = async (userInfo) => {
  try {
    const { username, email, role } = userInfo;
    let { password } = userInfo;

    if (await getUserByUsername(username))
      throw new DuplicateDataError("user with that username already exists");
    if (await getUserByEmail(email))
      throw new DuplicateDataError("user with that email already exists");

    if (password.length === 0) {
      password =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
    }
    const hashedPwd = await bcrypt.hash(password, 10);
    const newUserObj = {
      ...userInfo,
      password: hashedPwd,
    };

    let newUser;
    if (role === "Vendor") newUser = await vendorModel.create(newUserObj);
    else newUser = await userModel.create(newUserObj);

    return newUser;
  } catch (err) {
    console.error(err);
    if (err instanceof DuplicateDataError) throw err;
    else
      throw new GeneralServerError(
        `unexpected error in creating user: ${err.message}`
      );
  }
};

export const getUserById = async (id, options = {}) => {
  try {
    const isPopulate =
      options.populate && Object.keys(options.populate).length > 0;
    const isSelect = options.select !== null;
    const isLean = options.lean;
    const query = userModel.findOne({ _id: id });

    if (isPopulate) query.populate(options.populate);
    if (isSelect) query.select(options.select);
    if (isLean) query.lean();

    const user = await query.exec();
    if (!user) throw new DataNotFoundError("User with that ID is not found");
    return user;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in getting user id: ${err.message}`
    );
  }
};

export const patchUser = async (id, updatedValues) => {
  try {
    if (updatedValues?.username) {
      const foundUser = await getUserByUsername(updatedValues.username);
      if (foundUser)
        throw new DuplicateDataError(
          "There is already a user with that username"
        );
    }
    if (updatedValues?.email) {
      const foundUser = await getUserByEmail(updatedValues.email);
      if (foundUser)
        throw new DuplicateDataError("There is already a user with that email");
    }
    console.log(updatedValues);
    const selectedFields =
      "username email businessType eventTypes businessLocation businessDescription";

    const user = await userModel
      .findOne({ _id: id })
      .select(selectedFields)
      .exec();

    if (!user) throw new DataNotFoundError("User with that ID is not found");

    for (const key in updatedValues) {
      user[key] = updatedValues[key];
    }

    await user.save();

    return user;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof DuplicateDataError)
      throw err;
    throw new GeneralServerError(
      `unexpected error in updating user details: ${err.message}`
    );
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
    throw new GeneralServerError(
      `unexpected error in deleting user: ${err.message}`
    );
  }
};

export const authenticateUser = async (user) => {
  try {
    const { username, password } = user;
    const findUser = await getUserByUsername(username);
    if (!findUser) throw new DataNotFoundError("incorrect credentials");

    const isPasswordMatch = await bcrypt.compare(password, findUser.password);
    if (!isPasswordMatch) throw new UnauthorizedError("incorrect credentials");

    const accessToken = issueAccessToken(findUser);
    const refreshToken = issueRefreshToken(findUser);

    findUser.refreshToken = refreshToken;
    await findUser.save();
    const authUser = { email: findUser.email, accessToken, refreshToken };

    return authUser;
  } catch (err) {
    if (err instanceof DataNotFoundError || err instanceof UnauthorizedError)
      throw err;
    throw new GeneralServerError(
      `unexpected error in authenticating user: ${err.message}`
    );
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

    const authUser = { accessToken, refreshToken, username: findUser.username };
    return authUser;
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    else
      throw GeneralServerError(
        `unexpected error in authenticating user via google: ${err.message}`
      );
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
    throw new GeneralServerError(
      `unexpected error in issuing new access token: ${err.message}`
    );
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
    throw new GeneralServerError(
      `unexpected error in logging out user: ${err.message}`
    );
  }
};

export const deleteUserEvent = async (userId, eventId) => {
  try {
    const user = await userModel.findByIdAndUpdate(userId, {
      $pull: { events: eventId },
    });
    if (!user)
      throw new DataNotFoundError("couldnt not found a user with that id");
  } catch (err) {
    if (err instanceof DataNotFoundError) throw err;
    throw new GeneralServerError(
      `unexpected error in deleting user's event: ${err.message}`
    );
  }
};
