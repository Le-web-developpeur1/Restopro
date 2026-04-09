import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // Vérifier si des catégories existent déjà
    const count = await Category.countDocuments();
    if (count > 0) {
      console.log('⚠️  Des catégories existent déjà');
      process.exit(0);
    }

    // Créer les catégories par défaut
    const categories = [
      { name: 'Entrées', icon: 'salad', color: '#22c55e', sort_order: 1 },
      { name: 'Plats principaux', icon: 'utensils', color: '#f59e0b', sort_order: 2 },
      { name: 'Boissons', icon: 'coffee', color: '#3b82f6', sort_order: 3 },
      { name: 'Desserts', icon: 'cake', color: '#ec4899', sort_order: 4 },
      { name: 'Grillades', icon: 'flame', color: '#ef4444', sort_order: 5 }
    ];

    await Category.insertMany(categories);
    console.log('✅ Catégories créées avec succès');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seed();
