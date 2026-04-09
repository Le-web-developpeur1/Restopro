# Backend Resto Iman

Backend Node.js avec MongoDB pour le système de gestion de restaurant.

## Installation

```bash
cd server
npm install
```

## Configuration

1. Créer un fichier `.env` basé sur `.env.example`
2. Installer et démarrer MongoDB :
   - Localement : `mongod`
   - Ou utiliser MongoDB Atlas (cloud gratuit)
3. Mettre à jour `MONGODB_URI` dans `.env`

## Démarrage

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur http://localhost:3000

Les catégories par défaut seront créées automatiquement au premier lancement.

## API Endpoints

### Authentification
- `GET /api/auth/has-admin` - Vérifier si un admin existe
- `POST /api/auth/setup-admin` - Créer le premier admin
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Récupérer le profil (authentifié)

### Produits
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit (admin)
- `PUT /api/products/:id` - Modifier un produit (admin)
- `DELETE /api/products/:id` - Supprimer un produit (admin)

### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie (admin)
- `PUT /api/categories/:id` - Modifier une catégorie (admin)
- `DELETE /api/categories/:id` - Supprimer une catégorie (admin)

### Commandes
- `GET /api/orders` - Liste des commandes
- `GET /api/orders/:id` - Détails d'une commande
- `POST /api/orders` - Créer une commande
- `PUT /api/orders/:id` - Modifier une commande (admin/caissier)
- `GET /api/orders/stats/dashboard` - Statistiques du dashboard
