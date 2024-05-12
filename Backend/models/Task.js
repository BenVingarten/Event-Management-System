import mongoose from "mongoose";
const { Schema } = mongoose;
import { taskStatus } from "../constants/event.js";
const taskSchema = new Schema({
  _id: false, 
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: taskStatus[2],
  },
  priority: {
    type: Number,
    required: true
  },
});

taskSchema.index({priority : 1});
const taskModel = mongoose.model("Task", taskSchema);
export default taskModel; 