import mongoose from "mongoose";
const { Schema } = mongoose;

 const eventSchema = new Schema({
    "name": {
        type: String,
        required: true 
    },
    "date": {
        type: Date
    },
    "editors": [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    "location": {
        type: String
    },
    "tasks": [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    "guests": [{
        type: Schema.Types.ObjectId,
        ref: 'Guest'
    }]
});

const eventModel = mongoose.model("Event", eventSchema);
export default eventModel;