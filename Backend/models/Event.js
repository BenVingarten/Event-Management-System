import mongoose from "mongoose";
const { Schema } = mongoose;

const getCurrentTime = () => {
  const currentTimestamp = Date.now();
  const threeHoursLater = new Date(currentTimestamp + 3 * 60 * 60 * 1000);
  return threeHoursLater;
};

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
  },
  budget: {
    type: Number,
    default: 1000, //todo {}
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: getCurrentTime(),
    immutable: true,
  },
  updatedAt: {
    type: Date,
  },
});

eventSchema.pre("save", function (next) {
  this.updatedAt = getCurrentTime();
  next();
});

const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;
