// backend/controllers/userController.js
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Non autorisé, token manquant ou invalide');
    }
    const user = await User.findById(req.user._id)
        .select('-password -__v')
        .populate('badges', 'name icon unlocked');

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    res.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isBusinessUser: user.isBusinessUser,
        badges: user.badges,
        stats: user.stats
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Non autorisé, token manquant ou invalide');
    }
    const user = await User.findById(req.user._id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            isBusinessUser: updatedUser.isBusinessUser
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUserAccount = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Non autorisé, token manquant ou invalide');
    }
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    if (user._id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Non autorisé');
    }

    await user.deleteOne();
    res.json({ message: 'Compte utilisateur supprimé' });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Non autorisé, token manquant ou invalide');
    }
    const user = await User.findById(req.user._id).select('stats');

    if (!user || !user.stats) {
        return res.status(404).json({ message: 'Statistiques non trouvées' });
    }

    res.json(user.stats);
});
