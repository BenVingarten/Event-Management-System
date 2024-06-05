import mongoose from "mongoose";
const { Schema } = mongoose;

const suggstedTaskSchema = new Schema({
  title: {
    type: String,
    required: true,
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
