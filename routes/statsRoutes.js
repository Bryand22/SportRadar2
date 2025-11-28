import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Challenge from '../models/Challenge.js';

const router = express.Router();

// Middleware pour vérifier si c'est un business user
const businessOnly = (req, res, next) => {
    if (!req.user.isBusinessUser) {
        return res.status(403).json({ msg: 'Accès réservé aux entreprises' });
    }
    next();
};

// @desc    Stats globales de l'entreprise
// @route   GET /api/stats/global
// @access  Private (business only)
router.get('/global', protect, businessOnly, async (req, res) => {
    try {
        const employees = await User.find({ businessOwner: req.user.id });
        const employeeIds = employees.map(emp => emp._id);

        const totalActivities = await Activity.countDocuments({ user: { $in: employeeIds } });
        const totalHours = await Activity.aggregate([
            { $match: { user: { $in: employeeIds } } },
            { $group: { _id: null, total: { $sum: "$duration" } } }
        ]);

        res.json({
            totalEmployees: employees.length,
            totalActivities,
            totalHours: totalHours[0] ? totalHours[0].total : 0
        });
    } catch (err) {
        console.error('Erreur stats globales:', err);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

// @desc    Top employés par activités complétées
// @route   GET /api/stats/top-employees
// @access  Private (business only)
router.get('/top-employees', protect, businessOnly, async (req, res) => {
    try {
        const employees = await User.find({ businessOwner: req.user.id });
        const employeeIds = employees.map(emp => emp._id);

        const stats = await Activity.aggregate([
            { $match: { user: { $in: employeeIds } } },
            { $group: { _id: "$user", totalActivities: { $sum: 1 } } },
            { $sort: { totalActivities: -1 } },
            { $limit: 5 }
        ]);

        const topEmployees = await Promise.all(stats.map(async s => {
            const user = await User.findById(s._id).select('firstName lastName email');
            return { ...user.toObject(), totalActivities: s.totalActivities };
        }));

        res.json(topEmployees);
    } catch (err) {
        console.error('Erreur top employés:', err);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

// @desc    Stats par challenge
// @route   GET /api/stats/challenges
// @access  Private (business only)
router.get('/challenges', protect, businessOnly, async (req, res) => {
    try {
        const challenges = await Challenge.find({ business: req.user.id });

        const challengeStats = await Promise.all(challenges.map(async c => {
            const completedActivities = await Activity.countDocuments({ challenge: c._id });
            return {
                challengeId: c._id,
                name: c.name,
                completedActivities
            };
        }));

        res.json(challengeStats);
    } catch (err) {
        console.error('Erreur stats challenges:', err);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

export default router;
