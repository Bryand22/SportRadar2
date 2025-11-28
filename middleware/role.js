module.exports = (requiredRole) => {
    return (req, res, next) => {
        // Vérifier le rôle de l'utilisateur
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ msg: 'Accès non autorisé' });
        }
        next();
    };
};