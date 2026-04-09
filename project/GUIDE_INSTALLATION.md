# Guide d'Installation - Resto Iman

## Prérequis

1. **Node.js** (v18 ou supérieur)
2. **MongoDB** installé et en cours d'exécution

### Installer MongoDB sur Windows

```bash
# Télécharger depuis: https://www.mongodb.com/try/download/community
# Ou avec Chocolatey:
choco install mongodb

# Démarrer MongoDB
mongod
```

## Installation

### 1. Backend

```bash
cd server
npm install
```

### 2. Configuration Backend

Le fichier `.env` est déjà créé dans `server/.env` avec:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/resto_iman
JWT_SECRET=resto_iman_secret_key_2024_change_me_in_production
NODE_ENV=development
```

### 3. Initialiser les catégories et produits par défaut

```bash
cd server
# Créer les catégories
node src/scripts/seed.js

# Créer les produits exemples
node src/scripts/seed-products.js
```

### 4. Démarrer le backend

```bash
cd server
npm run dev
```

Le serveur démarre sur http://localhost:3000

### 5. Frontend

Dans un nouveau terminal:

```bash
# Retourner à la racine du projet
cd ..

# Installer les dépendances
npm install

# Démarrer le frontend
npm run dev
```

Le frontend démarre sur http://localhost:5173

## Première Connexion

1. Ouvrir http://localhost:5173
2. Tu verras l'écran de "Configuration initiale"
3. Créer le compte administrateur:
   - Nom complet: Ton nom
   - Email: ton@email.com
   - Mot de passe: minimum 6 caractères
4. Cliquer sur "Créer le compte admin"
5. Te connecter avec tes identifiants

## Vérification

### Backend fonctionne ?
```bash
curl http://localhost:3000/health
```

Devrait retourner: `{"status":"ok","timestamp":"..."}`

### MongoDB fonctionne ?
```bash
mongosh
use resto_singa
db.categories.find()
db.products.find()
```

Devrait afficher les 5 catégories et 17 produits par défaut.

## Problèmes courants

### MongoDB ne démarre pas
```bash
# Vérifier si MongoDB est installé
mongod --version

# Créer le dossier de données si nécessaire
mkdir C:\data\db

# Démarrer MongoDB
mongod
```

### Port 3000 déjà utilisé
Modifier `PORT=3001` dans `server/.env` et `VITE_API_URL=http://localhost:3001/api` dans `.env` à la racine

### Erreur de connexion frontend → backend
Vérifier que:
1. Le backend tourne sur http://localhost:3000
2. Le fichier `.env` à la racine contient `VITE_API_URL=http://localhost:3000/api`
3. Redémarrer le frontend après modification du `.env`
