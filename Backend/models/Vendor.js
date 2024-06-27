import mongoose from "mongoose";
import userModel from "./User.js";
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
    type: String,
    required: true,
  },
  businessDescription: {
    type: String,
    required: true,
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
const vendorModel = userModel.discriminator("Vendor", vendorSchema);
export default vendorModel;
