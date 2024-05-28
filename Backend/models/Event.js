import mongoose from "mongoose";
const { Schema } = mongoose;
import { guestStatus, taskStatus } from "../constants/event.js";
const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
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
    type: [String],
    default: [],
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  cards: [
    {
      _id: false,
      title: {
        type: String,
        required: true,
      },
      column: {
        type: String,
        default: taskStatus[1],
      },
      id: {
        type: String,
        required: true,
      },
    },
  ],
  guestList: [
    {
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
        enum: guestStatus,
        default: guestStatus[1],
      },
      group: {
        type: String,
        required: true,
      },
      peopleCount: {
        type: Number,
        required: true,
      },
      comments: {
        type: String,
        default: "",
      },
    },
  ],
  createdAt: {
    type: Number,
    default: Date.now(),
    immutable: true,
  },
  updatedAt: {
    type: Number,
  },
});

eventSchema.index({ collabrators: 1, guestList: 1, _id: 1 });
eventSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);
const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;
