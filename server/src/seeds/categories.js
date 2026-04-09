import Category from '../models/Category.js';

export async function seedCategories() {
  const count = await Category.countDocuments();
  
  if (count === 0) {
    await Category.insertMany([
      { name: 'Entrées', icon: 'salad', color: '#22c55e', sort_order: 1 },
      { name: 'Plats principaux', icon: 'utensils', color: '#f59e0b', sort_order: 2 },
      { name: 'Boissons', icon: 'coffee', color: '#3b82f6', sort_order: 3 },
      { name: 'Desserts', icon: 'cake', color: '#ec4899', sort_order: 4 },
      { name: 'Grillades', icon: 'flame', color: '#ef4444', sort_order: 5 }
    ]);
    console.log('✅ Catégories par défaut créées');
  }
}
