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
  group: {
    type: String,
    required: true,
  },
  peopleCount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: guestStatus,
    default: guestStatus[1],
  },
  comments: {
    type: String
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "guest",
    required: true
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

guestSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);
guestSchema.index({ _id: 1, event: 1 });
const guestModel = mongoose.model("Guest", guestSchema);
export default guestModel;
