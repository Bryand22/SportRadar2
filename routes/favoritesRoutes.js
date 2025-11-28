import express from 'express';
import Favorite from '../models/Favorite.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ──────────────────────────────────────────
// GET /api/favorites - Récupérer tous les favoris de l'utilisateur
// ──────────────────────────────────────────
router.get('/', protect, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user_id: req.user.id });
        res.json(favorites);
    } catch (error) {
        console.error('Erreur récupération favoris:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des favoris' });
    }
});

// ──────────────────────────────────────────
// POST /api/favorites - Ajouter un favori (spot ou event)
// body: { item_id, type, name, address?, lat?, lng?, price? }
// ──────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { item_id, type, name, address, lat, lng, price } = req.body;

        if (!item_id || !type || !name) {
            return res.status(400).json({ msg: 'Champs obligatoires manquants : item_id, type, name' });
        }

        // Vérifier si le favori existe déjà
        const exists = await Favorite.findOne({ user_id: req.user.id, item_id, type });
        if (exists) {
            return res.status(400).json({ msg: 'Favori déjà existant' });
        }

        const favorite = new Favorite({
            user_id: req.user.id,
            item_id,
            type,       // "spot" ou "event"
            name,
            address: address || null,
            lat: lat || null,
            lng: lng || null,
            price: price || null,
            createdAt: new Date(),
        });

        await favorite.save();
        res.status(201).json({ msg: 'Favori ajouté', favorite });
    } catch (error) {
        console.error('Erreur ajout favori:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'ajout du favori' });
    }
});

// ──────────────────────────────────────────
// DELETE /api/favorites/:item_id - Supprimer un favori
// ──────────────────────────────────────────
router.delete('/:item_id', protect, async (req, res) => {
    try {
        const { item_id } = req.params;

        const deleted = await Favorite.findOneAndDelete({
            user_id: req.user.id,
            item_id,
        });

        if (!deleted) return res.status(404).json({ msg: 'Favori non trouvé' });

        res.json({ msg: 'Favori supprimé' });
    } catch (error) {
        console.error('Erreur suppression favori:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression du favori' });
    }
});

export default router;
