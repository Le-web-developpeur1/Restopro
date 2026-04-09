import express from 'express';
import Category from '../models/Category.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Récupérer toutes les catégories
router.get('/', authenticate, async (req, res) => {
  try {
    const categories = await Category.find().sort({ sort_order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une catégorie (admin seulement)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une catégorie (admin seulement)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une catégorie (admin seulement)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
