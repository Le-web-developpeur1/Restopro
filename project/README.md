# Resto Iman - Système de Gestion de Restaurant

Application complète de point de vente (POS) pour restaurant avec backend Node.js et frontend React.

## Structure du Projet

```
.
├── server/          # Backend Node.js + Express + PostgreSQL
└── src/             # Frontend React + TypeScript + Vite
```

## Installation

### 1. Backend

```bash
cd server
npm install
```

Créer un fichier `.env` dans le dossier `server` :

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/resto_iman
JWT_SECRET=votre_secret_jwt_super_securise
NODE_ENV=development
```

Créer la base de données et exécuter le schéma :

```bash
# Créer la base de données
createdb resto_iman

# Exécuter le schéma
psql -U votre_user -d resto_iman -f database/schema.sql
```

Démarrer le serveur :

```bash
npm run dev
```

### 2. Frontend

```bash
# À la racine du projet
npm install
```

Créer un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:3000/api
```

Démarrer l'application :

```bash
npm run dev
```

## Première Utilisation

1. Ouvrir http://localhost:5173
2. Créer le compte administrateur lors de la première connexion
3. Se connecter avec les identifiants créés

## Fonctionnalités

- Authentification avec JWT
- Gestion des utilisateurs (admin, caissier, serveur)
- Gestion du menu (catégories et produits)
- Point de vente (POS)
- Historique des commandes
- Tableau de bord avec statistiques
- Gestion des paramètres

## Technologies

### Backend
- Node.js + Express
- PostgreSQL
- JWT pour l'authentification
- bcryptjs pour le hachage des mots de passe

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icônes)

## API

Documentation complète disponible dans `server/README.md`
