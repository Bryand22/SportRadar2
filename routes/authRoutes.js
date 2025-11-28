import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Générer token JWT
const generateToken = (id) => jwt.sign({ user: { id } }, process.env.JWT_SECRET, { expiresIn: "1h" });
const generateRefreshToken = (id) => jwt.sign({ user: { id } }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

// helper centralisé pour créer un utilisateur (évite duplication register/signup)
async function createUser({ firstName, lastName, email, password, isBusinessUser, consent, policyVersion }) {
    // sécurité : refuser payloads contenant un hash côté client
    if (typeof password === 'string' && /^\$2[aby]\$/.test(password)) {
        const err = new Error('Ne pas envoyer de mot de passe pré‑haché depuis le client');
        err.status = 400;
        throw err;
    }

    console.log(`[createUser] creating user ${email} — hashing password`);

    if (!consent) {
        const err = new Error('Le consentement au traitement des données est requis.');
        err.status = 400;
        throw err;
    }

    let existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('Utilisateur déjà existant');
        err.status = 400;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isBusinessUser,
        consent,
        consentAt: new Date(),
        policyVersion: policyVersion || 'v1.0'
    });

    await user.save();

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return {
        token,
        refreshToken,
        user
    };
}

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password, isBusinessUser, consent } = req.body;
        const result = await createUser({ firstName, lastName, email, password, isBusinessUser, consent, policyVersion: req.body.policyVersion });
        const user = result.user;
        res.status(201).json({
            token: result.token,
            refreshToken: result.refreshToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isBusinessUser: user.isBusinessUser,
                consent: !!user.consent,
                goals: user.goals || [],
                stats: user.stats || {},
                badges: user.badges || []
            }
        });
    } catch (err) {
        console.error("Erreur register:", err.message || err);
        const status = err.status || 500;
        res.status(status).json({ msg: err.message || "Server error" });
    }
});

// @route   POST /api/auth/login
// Dans authRoutes.js - route /login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("=== TENTATIVE DE CONNEXION ===");
    console.log("Email reçu:", email);

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log("❌ Aucun utilisateur trouvé");
            return res.status(400).json({ msg: "Email ou mot de passe incorrect" });
        }

        console.log("✅ Utilisateur trouvé:", user.email);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ msg: "Email ou mot de passe incorrect" });
        }

        // Générer tokens (identique à register)
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            token,
            refreshToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isBusinessUser: user.isBusinessUser,
                consent: !!user.consent,
                goals: user.goals || [],
                stats: user.stats || {
                    completedActivities: 0,
                    totalHours: 0,
                    avgIntensity: 0,
                    activeStreak: 0
                },
                badges: user.badges || []
            }
        });

    } catch (err) {
        console.error("Erreur login détaillée:", err);
        res.status(500).json({ msg: "Erreur serveur" });
    }
});

// @route   GET /api/auth/me
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isBusinessUser: user.isBusinessUser,
            goals: user.goals || [],
            stats: user.stats || { completedActivities: 0, totalHours: 0, avgIntensity: 0, activeStreak: 0 },
            badges: user.badges || []
        });
    } catch (err) {
        console.error("Erreur /me:", err);
        res.status(500).send("Server error");
    }
});

// @route   POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ error: "Refresh token requis" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.user.id);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const newToken = generateToken(user.id);
        res.json({ token: newToken });
    } catch (err) {
        console.error("Erreur refresh token:", err);
        let errorMsg = "Token invalide";
        if (err.name === "TokenExpiredError") errorMsg = "Token expiré";
        if (err.name === "JsonWebTokenError") errorMsg = "Signature invalide";
        res.status(401).json({ error: errorMsg });
    }
});

// @route   POST /api/auth/signup
// Version alias qui réutilise la même logique pour compatibilité (évite divergence)
router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, password, isBusinessUser, consent } = req.body;
        const result = await createUser({ firstName, lastName, email, password, isBusinessUser, consent, policyVersion: req.body.policyVersion });
        const user = result.user;
        res.status(201).json({
            token: result.token,
            refreshToken: result.refreshToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isBusinessUser: user.isBusinessUser,
                consent: !!user.consent,
                goals: user.goals || [],
                stats: user.stats || { completedActivities: 0, totalHours: 0, avgIntensity: 0, activeStreak: 0 },
                badges: user.badges || []
            }
        });
    } catch (err) {
        console.error("Erreur signup:", err.message || err);
        const status = err.status || 500;
        res.status(status).json({ msg: err.message || "Server error" });
    }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        // endpoint accessible uniquement en développement
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({ msg: 'Reset password endpoint is disabled except in development' });
        }

        const serverSecret = process.env.DEV_RESET_SECRET;
        const clientSecret = req.headers['x-dev-secret'] || req.body.devSecret;

        // si un secret est configuré, il doit être fourni
        if (serverSecret && clientSecret !== serverSecret) {
            return res.status(401).json({ msg: 'Invalid dev secret' });
        }

        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ msg: 'email & newPassword required' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        const result = await User.updateOne({ email }, { $set: { password: hashed } });

        if (result.matchedCount === 0 && result.modifiedCount === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        return res.json({ ok: true });
    } catch (err) {
        console.error('reset-password err', err);
        return res.status(500).json({ msg: 'error' });
    }
});

export default router;
