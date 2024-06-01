import mongoose from "mongoose";
const { Schema } = mongoose;
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
      type: Schema.Types.ObjectId,
      ref: "Task",
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

eventSchema.index({ collabrators: 1, guestList: 1, _id: 1 });
eventSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);
const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;
