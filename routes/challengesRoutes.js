import express from "express";
import { check, validationResult } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import Challenge from "../models/Challenge.js";

const router = express.Router();

// @route   GET api/challenges
// @desc    Get all challenges for a business
// @access  Private (Business users only)
router.get('/', protect, async (req, res) => {
    try {
        if (!req.user || !req.user.isBusinessUser) {
            return res.status(403).json({ msg: 'Accès non autorisé' });
        }
        const challenges = await Challenge.find({ business: req.user.id });
        res.json(challenges);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// @route   POST api/challenges
// @desc    Create a new challenge
// @access  Private (Business users only)
router.post(
    '/',
    [
        protect,
        [
            check('name', 'Le nom est requis').not().isEmpty(),
            check('goal', "L'objectif est requis et doit être un nombre").isNumeric(),
            check('unit', "L'unité est requise").not().isEmpty(),
            check('startDate', 'La date de début est requise').not().isEmpty(),
            check('endDate', 'La date de fin est requise').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (!req.user || !req.user.isBusinessUser) {
            return res.status(403).json({ msg: 'Accès non autorisé' });
        }
        const { name, description, goal, unit, startDate, endDate } = req.body;
        try {
            const newChallenge = new Challenge({
                business: req.user.id,
                name,
                description,
                goal,
                unit,
                startDate,
                endDate,
            });
            const challenge = await newChallenge.save();
            res.json(challenge);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erreur serveur');
        }
    }
);

// @route   PUT api/challenges/:id
// @desc    Update a challenge
// @access  Private (Business users only)
// @access  Private (Business users only)
router.put('/:id', protect, async (req, res) => {
    res.status(501).json({ msg: "Not implemented yet" });
});

// @route   DELETE api/challenges/:id
// @desc    Delete a challenge
// @access  Private (Business users only)
router.delete('/:id', protect, async (req, res) => {
    res.status(501).json({ msg: "Not implemented yet" });
});

export default router;