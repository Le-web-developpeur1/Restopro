# Guide de gestion des produits

## Initialisation rapide

### 1. Créer les catégories et produits de base

```bash
cd server

# Créer les 5 catégories (Entrées, Plats principaux, Grillades, Boissons, Desserts)
node src/scripts/seed.js

# Créer 17 produits exemples
node src/scripts/seed-products.js
```

## Gestion des produits via l'interface Admin

### Accéder à la page Menu

1. Se connecter en tant qu'admin
2. Aller dans le menu "Menu"
3. Tu verras tous les produits organisés par catégorie

### Créer un nouveau produit

1. Cliquer sur "Nouveau produit"
2. Remplir le formulaire :
   - **Nom du produit** : Ex: "Poulet Yassa"
   - **Description** : Ex: "Poulet mariné avec oignons et citron"
   - **Prix** : Ex: 4500 (en FCFA)
   - **Catégorie** : Sélectionner dans la liste (Plats principaux, Boissons, etc.)
   - **Disponible** : Cocher si le produit est disponible à la vente
3. Cliquer sur "Créer"

### Modifier un produit

1. Cliquer sur l'icône crayon (✏️) sur le produit
2. Modifier les informations
3. Cliquer sur "Modifier"

### Supprimer un produit

1. Cliquer sur l'icône poubelle (🗑️) sur le produit
2. Confirmer la suppression

### Filtrer par catégorie

- Cliquer sur les boutons de catégorie en haut pour filtrer l'affichage
- Le nombre de produits par catégorie est affiché

## Utilisation au POS (Caisse)

Une fois les produits créés, le caissier peut :

1. Aller sur la page "Caisse"
2. Taper le nom du produit dans la recherche
3. Sélectionner le produit → le prix s'affiche automatiquement
4. Entrer la quantité
5. Cliquer "Ajouter à la vente"
6. Répéter pour chaque produit
7. Choisir le mode de paiement
8. Cliquer "Enregistrer et imprimer"

## Structure des catégories par défaut

1. **Entrées** - Salades, soupes, nems
2. **Plats principaux** - Poulet DG, Ndolé, Riz sauce
3. **Grillades** - Brochettes, côtelettes
4. **Boissons** - Eau, sodas, bières, jus
5. **Desserts** - Glaces, fruits, gâteaux

## Notes importantes

- Seul l'admin peut créer/modifier/supprimer des produits
- Les caissiers peuvent seulement voir et utiliser les produits au POS
- Un produit peut être marqué "Indisponible" sans être supprimé
- Chaque produit doit avoir un nom et un prix
- La catégorie est optionnelle mais recommandée pour l'organisation
