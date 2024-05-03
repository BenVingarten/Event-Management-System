import mongoose from "mongoose";
const { Schema } = mongoose;
import { taskStatus, guestStatus } from "../constants/event.js";

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    index: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  additionalInfo: {
    type: String,
    default: "",
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  taskList: [
    {
      task: String,
      status: {
        type: String,
        default: taskStatus[0],
      },
    },
  ],
  guestList: [
    {
      name: String,
      phoneNumber: String,
      status: {
        type: String,
        default: guestStatus[guestStatus.length - 1],
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  updatedAt: {
    type: Date,
  },
});

eventSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);

const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;
