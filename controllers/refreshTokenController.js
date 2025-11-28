import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token requis' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const newToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token: newToken });
    } catch (error) {
        console.error('Refresh token error:', error);

        let errorMsg = 'Token invalide';
        if (error.name === 'TokenExpiredError') errorMsg = 'Token expiré';
        if (error.name === 'JsonWebTokenError') errorMsg = 'Signature invalide';

        res.status(401).json({ error: errorMsg });
    }
};