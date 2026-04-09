import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // Récupérer les catégories
    const categories = await Category.find();
    const catMap = {};
    categories.forEach(cat => {
      catMap[cat.name] = cat._id;
    });

    // Vérifier si des produits existent déjà
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`⚠️  ${count} produits existent déjà`);
      const response = await new Promise(resolve => {
        process.stdin.once('data', data => resolve(data.toString().trim()));
        console.log('Voulez-vous les supprimer et recommencer ? (oui/non)');
      });
      
      if (response.toLowerCase() === 'oui') {
        await Product.deleteMany({});
        console.log('✅ Produits supprimés');
      } else {
        process.exit(0);
      }
    }

    // Produits exemples
    const products = [
      // Entrées
      { name: 'Salade César', description: 'Salade fraîche avec poulet grillé', price: 2500, category_id: catMap['Entrées'], available: true },
      { name: 'Soupe du jour', description: 'Soupe maison', price: 1500, category_id: catMap['Entrées'], available: true },
      { name: 'Nems', description: 'Nems croustillants (5 pièces)', price: 2000, category_id: catMap['Entrées'], available: true },
      
      // Plats principaux
      { name: 'Poulet DG', description: 'Poulet Directeur Général avec plantain', price: 5000, category_id: catMap['Plats principaux'], available: true },
      { name: 'Riz sauce tomate', description: 'Riz avec sauce tomate et viande', price: 3500, category_id: catMap['Plats principaux'], available: true },
      { name: 'Ndolé', description: 'Plat traditionnel camerounais', price: 4000, category_id: catMap['Plats principaux'], available: true },
      { name: 'Poisson braisé', description: 'Poisson frais grillé', price: 4500, category_id: catMap['Plats principaux'], available: true },
      
      // Grillades
      { name: 'Brochettes bœuf', description: 'Brochettes de bœuf (3 pièces)', price: 3000, category_id: catMap['Grillades'], available: true },
      { name: 'Brochettes poulet', description: 'Brochettes de poulet (3 pièces)', price: 2500, category_id: catMap['Grillades'], available: true },
      { name: 'Côtelettes', description: 'Côtelettes grillées', price: 3500, category_id: catMap['Grillades'], available: true },
      
      // Boissons
      { name: 'Eau minérale', description: 'Eau minérale 50cl', price: 500, category_id: catMap['Boissons'], available: true },
      { name: 'Coca-Cola', description: 'Coca-Cola 33cl', price: 800, category_id: catMap['Boissons'], available: true },
      { name: 'Jus naturel', description: 'Jus de fruits frais', price: 1000, category_id: catMap['Boissons'], available: true },
      { name: '33 Export', description: 'Bière locale', price: 1200, category_id: catMap['Boissons'], available: true },
      
      // Desserts
      { name: 'Glace vanille', description: 'Glace artisanale vanille', price: 1500, category_id: catMap['Desserts'], available: true },
      { name: 'Fruit de saison', description: 'Fruits frais du jour', price: 1000, category_id: catMap['Desserts'], available: true },
      { name: 'Gâteau chocolat', description: 'Part de gâteau au chocolat', price: 2000, category_id: catMap['Desserts'], available: true }
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} produits créés avec succès`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedProducts();
