import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    item_id: {  // Utiliser un champ unique pour les deux types
        type: String,
        required: true
    },
    name: String,
    type: {
        type: String,
        enum: ['spot', 'event'],
        required: true
    },
    address: String,
    lat: Number,
    lng: Number,
    price: Number,
    createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Favorite', FavoriteSchema);