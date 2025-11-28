import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    goal: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['steps', 'km', 'hours', 'activities'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    progress: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Challenge = mongoose.model('Challenge', ChallengeSchema);

export default Challenge;