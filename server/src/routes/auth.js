import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Vérifier si un admin existe
router.get('/has-admin', async (req, res) => {
  try {
    const adminExists = await User.exists({ role: 'admin' });
    res.json({ hasAdmin: !!adminExists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configuration initiale - créer le premier admin
router.post('/setup-admin', async (req, res) => {
  const { email, password, full_name } = req.body;

  try {
    const adminExists = await User.exists({ role: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({ error: 'Un administrateur existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      role: 'admin'
    });

    res.json({ success: true, message: 'Administrateur créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer le profil de l'utilisateur connecté
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }

    res.json({
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
