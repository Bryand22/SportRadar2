import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type_sport: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    gratuit: { type: Boolean, default: false },
    payant: { type: Boolean, default: false },
    address: String,
    description: String,
    rating: { type: Number, default: 0 },
    photos: [String],
    created_at: { type: Date, default: Date.now }
});

// Index géospatial pour les recherches par proximité
spotSchema.index({ location: '2dsphere' });

export default mongoose.model('Spot', spotSchema);