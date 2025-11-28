const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    activitiesCompleted: {
        type: Number,
        default: 0
    },
    lastActive: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index pour éviter les doublons
EmployeeSchema.index({ business: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Employee', EmployeeSchema);