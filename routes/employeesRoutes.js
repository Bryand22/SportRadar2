import express from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware pour vérifier si c'est un business user
const businessOnly = (req, res, next) => {
    if (!req.user.isBusinessUser) {
        return res.status(403).json({ msg: 'Accès réservé aux entreprises' });
    }
    next();
};

// @desc    Get all employees for business
// @route   GET /api/employees
// @access  Private (business only)
router.get('/', protect, businessOnly, async (req, res) => {
    try {
        const employees = await User.find({ businessOwner: req.user.id }).select('-password');
        res.json(employees);
    } catch (err) {
        console.error('Erreur récupération employés:', err);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

// @desc    Add a new employee
// @route   POST /api/employees
// @access  Private (business only)
router.post(
    '/',
    protect,
    businessOnly,
    [
        check('firstName', 'Prénom requis').not().isEmpty(),
        check('lastName', 'Nom requis').not().isEmpty(),
        check('email', 'Email valide requis').isEmail(),
        check('password', 'Mot de passe de 6 caractères minimum requis').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { firstName, lastName, email, password } = req.body;

            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ msg: 'Utilisateur déjà existant' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newEmployee = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                businessOwner: req.user.id
            });

            await newEmployee.save();
            res.status(201).json({ msg: 'Employé ajouté', employee: { ...newEmployee.toObject(), password: undefined } });
        } catch (err) {
            console.error('Erreur ajout employé:', err);
            res.status(500).json({ msg: 'Erreur serveur' });
        }
    }
);

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (business only)
router.put('/:id', protect, businessOnly, async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);
        if (!employee) return res.status(404).json({ msg: 'Employé non trouvé' });
        if (employee.businessOwner.toString() !== req.user.id)
            return res.status(403).json({ msg: 'Non autorisé' });

        const updates = { ...req.body };

        // Si on met à jour le mot de passe, le hasher
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        Object.assign(employee, updates);
        await employee.save();

        res.json({ msg: 'Employé mis à jour', employee: { ...employee.toObject(), password: undefined } });
    } catch (err) {
        console.error('Erreur mise à jour employé:', err);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (business only)
router.delete('/:id', protect, businessOnly, async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);
        if (!employee) return res.status(404).json({ msg: 'Employé non trouvé' });
        if (employee.businessOwner.toString() !== req.user.id)
            return res.status(403).json({ msg: 'Non autorisé' });

        await employee.remove();
        res.json({ msg: 'Employé supprimé' });
    } catch (err) {
        console.error('Erreur suppression employé:', err);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

export default router;
