import mongoose from "mongoose";
const { Schema } = mongoose;

const inviteSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
  },
  status: {
    type: String,
    default: "Pending",
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
