import mongoose from "mongoose";
import { guestStatus } from "../constants/event.js";
const { Schema } = mongoose;

const guestSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: guestStatus[2],
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

guestSchema.index({ collabrators: 1 });
guestSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);

const guestModel = mongoose.model("Guest", guestSchema);
export default guestModel;
