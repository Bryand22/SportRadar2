import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Challenge from './models/Challenge.js';
import Spot from './models/Spot.js';
import Favorite from './models/Favorite.js';

dotenv.config(); // ⚡ charge .env automatiquement

console.log('Tentative de connexion avec URI:', process.env.MONGO_URI);

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB');

        // Nettoyage
        await User.deleteMany({});
        await Challenge.deleteMany({});
        await Spot.deleteMany({});
        await Favorite.deleteMany({});

        // Users
        const businessUser = await User.create({
            firstName: 'Admin',
            lastName: 'SportRadar',
            email: 'admin@sportradar.com',
            password: 'Admin123',
            isBusinessUser: true,
            role: 'admin'
        });

        const regularUser = await User.create({
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@test.com',
            password: 'Test123',
            isBusinessUser: false
        });

        // Spots
        const spots = await Spot.create([
            { name: 'Stade de France', type_sport: 'Football', lat: 48.9244, lng: 2.3604, gratuit: false, payant: true, address: 'Saint-Denis, 93', description: 'Stade mythique', rating: 4.5 },
            { name: 'Parc de la Villette', type_sport: 'Yoga', lat: 48.8947, lng: 2.3874, gratuit: true, payant: false, address: 'Paris 19e', description: 'Parc parfait pour le yoga', rating: 4.2 }
        ]);

        // Challenge
        const marathonChallenge = await Challenge.create({
            name: "Marathon Printanier",
            description: "Parcourez 100km en avril",
            goal: 100,
            unit: "km",
            sportType: "running",
            startDate: new Date('2024-04-01'),
            endDate: new Date('2024-04-30'),
            business: businessUser._id,
            rewards: "T-shirt exclusif pour les finishers"
        });

        // Favoris
        await Favorite.create({ user_id: regularUser._id, spot_id: spots[1]._id });

        console.log('✅ Données seedées');
        process.exit(0);

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
};

seedData();
