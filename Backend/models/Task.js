import mongoose from "mongoose";
import { taskStatus } from "../constants/event.js";
const { Schema } = mongoose;

const taskSchema = new Schema({
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
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
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

taskSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);
taskSchema.index({ _id: 1, event: 1 });
const taskModel = mongoose.model("Task", taskSchema);
export default taskModel;
