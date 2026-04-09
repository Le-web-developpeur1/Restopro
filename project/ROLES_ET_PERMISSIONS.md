# Rôles et Permissions - Resto Iman

## 🔐 Rôles Disponibles

### 1. Administrateur (admin)
**Accès complet au système**

Pages accessibles :
- ✅ Tableau de bord - Vue complète des statistiques
- ✅ Caisse / POS - Peut enregistrer des ventes
- ✅ Menu - Gérer produits et catégories
- ✅ Historique - Voir toutes les commandes
- ✅ Utilisateurs - Créer, modifier, supprimer des utilisateurs
- ✅ Paramètres - Configuration du système

Permissions :
- Voir toutes les ventes de tous les caissiers
- Créer et gérer les utilisateurs
- Modifier le menu (produits, catégories)
- Accès complet aux statistiques

### 2. Caissier (caissier)
**Interface simplifiée pour la caisse**

Pages accessibles :
- ✅ Caisse / POS - Enregistrer des ventes
- ✅ Historique - Voir les commandes
- ❌ Tableau de bord - Accès limité (message d'accueil uniquement)
- ❌ Menu - Pas d'accès
- ❌ Utilisateurs - Pas d'accès
- ❌ Paramètres - Pas d'accès

Permissions :
- Enregistrer des ventes
- Générer et imprimer des reçus
- Voir l'historique des commandes
- Pas de modification du menu
- Pas de gestion des utilisateurs

### 3. Serveur (serveur)
**Accès très limité (pour usage futur)**

Pages accessibles :
- ❌ Aucune page actuellement

Permissions :
- Aucune permission actuellement
- Rôle réservé pour développement futur

## 📋 Fonctionnalités par Rôle

### Enregistrement des Ventes
- ✅ Admin : Peut enregistrer des ventes
- ✅ Caissier : Peut enregistrer des ventes
- ❌ Serveur : Ne peut PAS enregistrer de ventes

### Impression de Reçus
- ✅ Admin : Peut imprimer
- ✅ Caissier : Peut imprimer
- ❌ Serveur : Pas d'accès

### Gestion du Menu
- ✅ Admin : Peut créer/modifier/supprimer
- ❌ Caissier : Lecture seule
- ❌ Serveur : Pas d'accès

### Gestion des Utilisateurs
- ✅ Admin : Accès complet
- ❌ Caissier : Pas d'accès
- ❌ Serveur : Pas d'accès

## 🎯 Redirection Automatique

Lors de la connexion :
- **Admin** → Redirigé vers le Tableau de bord
- **Caissier** → Redirigé vers la Caisse (POS)
- **Serveur** → Redirigé vers la Caisse (mais sans permission)

## 📊 Visibilité des Ventes

### Tableau de Bord (Admin uniquement)
- Affiche TOUTES les ventes de TOUS les caissiers
- Statistiques globales du restaurant
- Ventes du jour et du mois
- Commandes récentes

### Historique
- **Admin** : Voit toutes les commandes
- **Caissier** : Voit toutes les commandes

## 🖨️ Impression de Reçus

Après chaque vente validée :
1. Message de confirmation
2. Popup : "Voulez-vous imprimer le reçu ?"
3. Si Oui → Impression automatique du reçu
4. Format : Ticket de caisse 80mm

Contenu du reçu :
- Nom du restaurant
- Date et heure
- Numéro de commande
- Table (si renseignée)
- Liste des articles avec quantités et prix
- Total
- Méthode de paiement
- Montant reçu et monnaie (si espèces)

## 🔧 Configuration

Pour créer un nouveau caissier :
1. Se connecter en tant qu'Admin
2. Aller dans "Utilisateurs"
3. Cliquer sur "Nouvel utilisateur"
4. Remplir le formulaire :
   - Nom complet
   - Email
   - Mot de passe
   - **Rôle : Caissier**
5. Valider

Le caissier pourra ensuite se connecter et accéder uniquement à la caisse et l'historique.
