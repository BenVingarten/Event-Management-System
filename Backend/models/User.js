import mongoose from "mongoose";
import { rolesEnum } from "../constants/roles.js";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
});

userSchema.index({ username: 1 }, { unique: true });

const userModel = mongoose.model("User", userSchema);
export default userModel;
