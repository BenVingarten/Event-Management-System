import mongoose from "mongoose";
const { Schema } = mongoose;
import { guestStatus } from "../constants/event.js";
import { taskStatus } from "../constants/event.js";
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
    type: [String],
    default: [],
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  taskList: [
    {
      content: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: taskStatus,
        default: taskStatus[2],
      },
      priority: {
        type: Number,
        required: true,
      },
    },
  ],
  guestList: [
    {
      type: Schema.Types.ObjectId,
      ref: "Guest",
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

eventSchema.index({ collabrators: 1 });
eventSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);
// Middleware to populate events, collaborators, and guestList fields
eventSchema.pre(["findOne", "find"], function (next) {
  this.populate([
    { path: "collaborators", select: "email _id" },
    { path: "guestList", select: "name _id" },
  ]);
  next();
});

const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;
