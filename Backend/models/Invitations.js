import mongoose from "mongoose";
import { collabStatus } from "../constants/event.js";
const { Schema } = mongoose;

const inviteSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  status: {
    type: String,
    enum: collabStatus,
    default: collabStatus[0],
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    immutable: true,
  },
});

inviteSchema.index({ email: 1, event: 1 });
const InvitesModel = mongoose.model("Invites", inviteSchema);
export default InvitesModel;
