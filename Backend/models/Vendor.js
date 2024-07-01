import mongoose from "mongoose";
import userModel from "./User.js";
import { rolesEnum } from "../constants/user.js";
import { locations, eventType } from "../constants/event.js";
const { Schema } = mongoose;

const vendorSchema = new Schema({
  businessName: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  businessLocation: {
    type: [String],
    enum: locations,
    required: true
  },
  businessDescription: {
    type: String,
    required: true,
  },
  eventTypes: {
    type: [String],
    enum: eventType,
    required: true
  },
  leadCount: {
    type: Number,
    defaulr: 0
  },
  upcomingEvents: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },
  ],
});

// Define discriminator for Vendor
const vendorModel = userModel.discriminator(rolesEnum[2], vendorSchema);
export default vendorModel;
