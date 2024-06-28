import mongoose from "mongoose";
import { rolesEnum } from "../constants/user.js";

const { Schema } = mongoose;
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: rolesEnum,
    default: rolesEnum[1],
  },
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    immutable: true,
  },
  updatedAt: {
    type: Number,
  },
});

userSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const userModel = mongoose.model("User", userSchema);
export default userModel;
