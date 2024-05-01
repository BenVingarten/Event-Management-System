import mongoose from "mongoose";
const { Schema } = mongoose;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  budget: {
    type: Number,
    required: true
  },
  location : {
    type: String,
    required: true
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
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

eventSchema.pre(["save", "updateOne", "updateMany", "findOneAndUpdate"], function (next) {
  this.updatedAt = Date.now();
  next();
});

const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;
