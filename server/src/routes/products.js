import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les produits
router.get('/', authenticate, async (req, res) => {
  try {
    const products = await Product.find().populate('category_id').sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un produit (admin seulement)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un produit (admin seulement)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un produit (admin seulement)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
