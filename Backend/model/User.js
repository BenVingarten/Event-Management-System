import mongoose from "mongoose";
import ROLES_LIST from "../config/roles_list.js";
const { Schema } = mongoose;

 const userSchema = new Schema({
    "username": {
        type: String,
        required: true 
    },

    "roles": {
        "user": {
            type: Number,
            default: ROLES_LIST.User
        },
        "editor": Number,
        "admin": Number
    },

    "email": {
        type: String,
        required: true
    },
    
    "password": {
        type: String,
        required: true
    },
    
    "refreshToken": String,
    
    "events": [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

const userModel = mongoose.model("User", userSchema);
export default userModel;