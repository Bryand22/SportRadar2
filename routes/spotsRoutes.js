import express from 'express';
import Spot from '../models/Spot.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ──────────────────────────────────────────
// GET /api/spots - Récupérer tous les spots
// ──────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const spots = await Spot.find(); // récupère tous les spots depuis la DB
        res.json(spots);
    } catch (error) {
        console.error('Erreur récupération spots:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des spots' });
    }
});

// ──────────────────────────────────────────
// POST /api/spots - Créer un nouveau spot
// ──────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, address, lat, lng } = req.body;

        if (!name || !address || !lat || !lng) {
            return res.status(400).json({ msg: 'Champs obligatoires manquants' });
        }

        const newSpot = new Spot({
            name,
            description,
            address,
            lat,
            lng,
            createdBy: req.user.id,
        });

        const spot = await newSpot.save();
        res.status(201).json(spot);
    } catch (error) {
        console.error('Erreur création spot:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la création du spot' });
    }
});

export default router;
