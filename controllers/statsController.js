const User = require('../models/User');
const Activity = require('../models/Activity');

// @route   GET api/stats/user/:userId
// @desc    Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const stats = await Activity.aggregate([
            { $match: { user: mongoose.Types.ObjectId(req.params.userId) } },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: "$duration" },
                    completedActivities: { $count: {} },
                    avgIntensity: { $avg: "$intensityValue" }
                }
            }
        ]);

        res.json(stats[0] || {});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// @route   GET api/stats/business/:businessId
// @desc    Get business statistics
exports.getBusinessStats = async (req, res) => {
    try {
        const stats = await Employee.aggregate([
            { $match: { business: mongoose.Types.ObjectId(req.params.businessId) } },
            {
                $group: {
                    _id: null,
                    totalEmployees: { $count: {} },
                    activeEmployees: {
                        $sum: {
                            $cond: [{ $gte: ["$lastActive", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0]
                        }
                    },
                    totalActivities: { $sum: "$activitiesCompleted" }
                }
            }
        ]);

        res.json(stats[0] || {});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};