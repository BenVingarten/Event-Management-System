import mongoose from 'mongoose';
import { rolesEnum } from '../constants/roles.js';
const { Schema } = mongoose;


const userSchema = new Schema({
  "username": {
    type: String,
    required: true
  },
  "password": {
    type: String,
    required: true
  },
  "role": {
    type: String,
    default: rolesEnum[1]
  },
  "refreshToken": {
    type: String
  }
});

userSchema.index({ "username": 1 }, { unique: true });

const userModel = mongoose.model('User', userSchema);
export default userModel;
