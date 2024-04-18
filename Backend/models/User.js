import mongoose from "mongoose";
import { rolesEnum } from "../constants/roles.js";
const { Schema } = mongoose;

const getCurrentTime = () => {
  const currentTimestamp = Date.now();
  const threeHoursLater = new Date(currentTimestamp + 3 * 60 * 60 * 1000);
  return threeHoursLater;
};

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: getCurrentTime(),
    immutable: true,
  },
  updatedAt: {
    type: Date,
  },
});

userSchema.pre("save", function (next) {
  this.updatedAt = getCurrentTime();
  next();
});
userSchema.index({ username: 1 }, { unique: true });

const userModel = mongoose.model("User", userSchema);
export default userModel;
