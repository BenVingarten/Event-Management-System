import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
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
// Conditionally define fields based on user's role
userSchema.add({
  businessType: {
    type: String,
    required: function () {
      return this.role === "Vendor"; // Required only if role is Vendor
    },
  },
  businessLocation: {
    type: String,
    required: function () {
      return this.role === "Vendor"; // Required only if role is Vendor
    },
  },
  businessDescription: {
    type: String,
    required: function () {
      return this.role === "Vendor"; // Required only if role is Vendor
    },
  },
});

userSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const userModel = mongoose.model("User", userSchema);
export default userModel;
