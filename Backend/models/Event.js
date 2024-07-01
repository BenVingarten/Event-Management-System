import mongoose from "mongoose";
const { Schema } = mongoose;
import { collabStatus, vendorStatus } from "../constants/event.js";
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
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  collaborators: [
    {
      _id: false,
      collaboratorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      email: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: collabStatus,
        default: collabStatus[0],
      },
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
  vendors: [
    {
      _id: false,
      registeredUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      custom: {
          businessName: {
            type: String,
            required: true
          },
          email: {
            type: String,
            required: true
          },
          businessType: {
            type: String,
            required: true
          },
      },
      status: {
        type: String,
        enum: vendorStatus,
        required: true
      },
      priceForService: {
        type: Number,
        required: true
      }
    } 
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

eventSchema.index({
  "collabrators.collaboratorId": 1,
  "collaborators.email": 1,
  guestList: 1,
  _id: 1,
  owner: 1,
});
eventSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);
const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;
