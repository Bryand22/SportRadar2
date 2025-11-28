import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // RGPD - consentement pour création et traitement des données
    consent: { type: Boolean, required: true, default: false },
    consentAt: { type: Date }, // horodatage consentement (utile pour audit)
    policyVersion: { type: String }, // version de la politique acceptée
    isBusinessUser: { type: Boolean, default: false },
    goals: [String],
    badges: [{
        name: String,
        description: String,
        icon: String,
        unlocked: Boolean,
        progress: Number
    }],
    stats: {
        completedActivities: Number,
        totalHours: Number,
        avgIntensity: Number,
        activeStreak: Number
    },
    profilePicture: String
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);
export default User;