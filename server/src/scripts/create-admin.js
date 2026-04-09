import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('⚠️  Un administrateur existe déjà');
      console.log('Email:', adminExists.email);
      process.exit(0);
    }

    // Créer l'admin par défaut
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      email: 'admin@resto.com',
      password: hashedPassword,
      full_name: 'Administrateur',
      role: 'admin'
    });

    console.log('✅ Administrateur créé avec succès !');
    console.log('');
    console.log('📧 Email: admin@resto.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createAdmin();
