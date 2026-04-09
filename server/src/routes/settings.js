import express from 'express';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Upload du logo
router.post('/upload-logo', authenticate, requireRole('admin'), upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // URL du fichier uploadé
    const logoUrl = `/uploads/${req.file.filename}`;
    
    // Mettre à jour le restaurant avec le nouveau logo
    let restaurant = await Restaurant.findOne();
    if (!restaurant) {
      restaurant = await Restaurant.create({ logo: logoUrl });
    } else {
      restaurant.logo = logoUrl;
      await restaurant.save();
    }

    res.json({ logo: logoUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les infos du restaurant
router.get('/restaurant', authenticate, async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    
    // Si aucun restaurant n'existe, en créer un par défaut
    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: 'RESTO SINGA',
        currency: 'GNF'
      });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour les infos du restaurant (admin seulement)
router.put('/restaurant', authenticate, requireRole('admin'), async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    
    if (!restaurant) {
      restaurant = await Restaurant.create(req.body);
    } else {
      Object.assign(restaurant, req.body);
      await restaurant.save();
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour le profil utilisateur
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, email } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
    }
    
    user.full_name = full_name;
    user.email = email;
    await user.save();
    
    res.json({
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Changer le mot de passe
router.put('/password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }
    
    // Hasher et sauvegarder le nouveau mot de passe
    user.password = await bcrypt.hash(new_password, 10);
    await user.save();
    
    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
