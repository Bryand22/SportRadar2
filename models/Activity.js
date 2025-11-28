import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    name: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // ...autres champs...
});

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;