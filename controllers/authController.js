import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Générer un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};

// Générer un refresh token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    });
};

// @desc    Authentifier l'utilisateur
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
            refreshToken
        });
    } else {
        res.status(401);
        throw new Error('Email ou mot de passe invalide');
    }
});

// Ajouter cette fonction si elle n'existe pas
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Utilisateur déjà existant');
    }

    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
            refreshToken
        });
    } else {
        res.status(400);
        throw new Error('Données utilisateur invalides');
    }
});