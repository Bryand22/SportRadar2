import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Vérifier avec une tolérance de 5 secondes pour les décalages horaires
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 5 });

      req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);

      let errorMsg = 'Token invalide';
      if (error.name === 'TokenExpiredError') errorMsg = 'Token expiré';
      if (error.name === 'JsonWebTokenError') errorMsg = 'Signature invalide';

      res.status(401).json({
        message: errorMsg,
        solution: 'Veuillez rafraîchir votre token ou vous reconnecter'
      });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};