import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    getUserStats
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', protect, deleteUserAccount);

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, getUserStats);

export default router;