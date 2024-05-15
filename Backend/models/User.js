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

userSchema.pre(
  ["save", "updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    this.updatedAt = Date.now();
    next();
  }
);

userSchema.pre(["findOne", "find"], function (next) {
  this.populate({
    path: "events",
    select: "name date type budget location collaborators",
    populate: {
      path: "collaborators",
      select: "email _id",
    },
  });

  next();
});
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const userModel = mongoose.model("User", userSchema);
export default userModel;
