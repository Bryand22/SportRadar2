import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import spotsRoutes from './routes/spotsRoutes.js';
import activitiesRoutes from './routes/activitiesRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import challengesRoutes from './routes/challengesRoutes.js';
import employeesRoutes from './routes/employeesRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

// Configuration pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Vérifier les variables critiques
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`⚠️ ERREUR: Variable d'environnement manquante: ${varName}`);
    process.exit(1);
  }
});

// Connexion à la base de données
connectDB();

const app = express();

// Middlewares de sécurité
app.use(helmet());

const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000';
const whitelist = rawOrigins.split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Autorise les requêtes sans origin (postman, serveur -> serveur)
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) return callback(null, true);
    // Refuse sinon (le navigateur bloquera la requête CORS)
    return callback(new Error('Origin not allowed by CORS: ' + origin), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limiteur de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware pour parser le JSON
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spots', spotsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/weather', weatherRoutes);

// Middleware pour servir le frontend React (en production)
if (process.env.NODE_ENV === 'production') {
  // Chemin vers le dossier build du frontend
  const frontendPath = path.join(__dirname, 'frontend', 'build');

  // Vérifier si le dossier build existe
  import('fs').then(fs => {
    if (fs.existsSync(frontendPath)) {
      app.use(express.static(frontendPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(frontendPath, 'index.html'));
      });
    } else {
      console.warn('⚠️ Dossier frontend/build introuvable. Le serveur fonctionne en mode API uniquement.');
    }
  }).catch(err => {
    console.error('Erreur lors de l\'import de fs:', err);
  });
}

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err.stack);

  // Gestion spécifique des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expiré' });
  }

  res.status(500).json({
    error: 'Erreur serveur',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🔒 JWT_SECRET: ${process.env.JWT_SECRET ? 'défini' : 'non défini'}`);
  console.log(`🔄 JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? 'défini' : 'non défini'}`);
  console.log(`🗄️  Base de données: ${process.env.MONGO_URI ? 'connectée' : 'non connectée'}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'développement'}`);
  console.log(`=================================`);
});