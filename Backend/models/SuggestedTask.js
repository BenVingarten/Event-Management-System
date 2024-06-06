import mongoose from "mongoose";
const { Schema } = mongoose;

const suggestedTaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  eventTypes: {
    type: [String],
    required: true,
  },
  locations: {
    type: [String],
    required: true,
  },
  avgPrice: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const suggestedTaskModel = mongoose.model(
  "SuggestedTasks",
  suggestedTaskSchema
);
export default suggestedTaskModel;
