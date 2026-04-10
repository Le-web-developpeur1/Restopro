import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';
import { Shield, Store, User, Lock, Save, Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from '../lib/types';
import Modal from '../components/shared/Modal';

export default function Settings() {
  const { profile } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'restaurant' | 'categories' | 'profile' | 'security'>('restaurant');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Catégories
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '🍽️',
    color: '#f59e0b'
  });

  // Données du restaurant
  const [restaurantData, setRestaurantData] = useState({
    name: 'RESTO SINGA',
    address: '',
    phone: '',
    email: '',
    currency: 'GNF',
    logo: ''
  });

  // Données du profil
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || ''
  });

  // Données de sécurité
  const [securityData, setSecurityData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadRestaurantInfo();
      loadCategories();
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name,
        email: profile.email || ''
      });
    }
  }, [profile]);

  async function loadRestaurantInfo() {
    try {
      const data = await api.getRestaurantInfo();
      setRestaurantData(data as any);
    } catch (error) {
      console.error('Erreur chargement infos restaurant:', error);
    }
    setLoading(false);
  }

  async function loadCategories() {
    try {
      const data = await api.getCategories();
      setCategories((data as any[]).map(c => ({ ...c, id: c._id || c.id })));
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  }

  function openCategoryModal(category?: Category) {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        icon: category.icon,
        color: category.color
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        icon: '🍽️',
        color: '#f59e0b'
      });
    }
    setShowCategoryModal(true);
  }

  async function handleSaveCategory() {
    if (!categoryForm.name.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
        toast.success('Catégorie mise à jour !');
      } else {
        await api.createCategory(categoryForm);
        toast.success('Catégorie créée !');
      }
      setShowCategoryModal(false);
      loadCategories();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
    setSaving(false);
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await api.deleteCategory(id);
      toast.success('Catégorie supprimée !');
      loadCategories();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  }

  async function handleSaveRestaurant() {
    setSaving(true);
    try {
      await api.updateRestaurantInfo(restaurantData);
      toast.success('Informations du restaurant sauvegardées !');
      // Rafraîchir les infos du restaurant dans le contexte
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
    setSaving(false);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadLogo(file);
      // Utiliser l'URL de l'API au lieu de localhost en dur
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const baseUrl = apiUrl.replace('/api', '');
      setRestaurantData({ ...restaurantData, logo: `${baseUrl}${result.logo}` });
      toast.success('Logo uploadé avec succès !');
    } catch (error: any) {
      toast.error('Erreur lors de l\'upload: ' + error.message);
    }
    setUploading(false);
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await api.updateProfile(profileData);
      toast.success('Profil mis à jour !');
      // Recharger la page pour mettre à jour le profil dans le contexte
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (securityData.new_password !== securityData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (securityData.new_password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSaving(true);
    try {
      await api.changePassword({
        current_password: securityData.current_password,
        new_password: securityData.new_password
      });
      toast.success('Mot de passe changé avec succès !');
      setSecurityData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
    setSaving(false);
  }

  if (!isAdmin) {
    // Pour les non-admins, afficher uniquement la section sécurité
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre mot de passe</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Lock size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Sécurité</h2>
              <p className="text-sm text-gray-500">Changez votre mot de passe</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>Conseil :</strong> Utilisez un mot de passe fort avec au moins 6 caractères.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel *
              </label>
              <input
                type="password"
                value={securityData.current_password}
                onChange={(e) => setSecurityData({ ...securityData, current_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                value={securityData.new_password}
                onChange={(e) => setSecurityData({ ...securityData, new_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe *
              </label>
              <input
                type="password"
                value={securityData.confirm_password}
                onChange={(e) => setSecurityData({ ...securityData, confirm_password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving || !securityData.current_password || !securityData.new_password}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <Lock size={18} />
              {saving ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Configuration du système</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'restaurant'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Store size={18} />
            Restaurant
          </div>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'categories'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag size={18} />
            Catégories
          </div>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'profile'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={18} />
            Mon profil
          </div>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'security'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock size={18} />
            Sécurité
          </div>
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Onglet Restaurant */}
        {activeTab === 'restaurant' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Store size={24} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Informations du restaurant</h2>
                <p className="text-sm text-gray-500">Gérez les informations de votre établissement</p>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo du restaurant
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés: JPG, PNG, GIF, WEBP (max 5MB)
                </p>
                {uploading && (
                  <p className="text-sm text-amber-600 mt-2">Upload en cours...</p>
                )}
                {restaurantData.logo && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                    <img 
                      src={restaurantData.logo} 
                      alt="Logo" 
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du restaurant *
                </label>
                <input
                  type="text"
                  value={restaurantData.name}
                  onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={restaurantData.address}
                  onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                  placeholder="Ex: Conakry, Guinée"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={restaurantData.phone}
                    onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
                    placeholder="Ex: +224 XXX XX XX XX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={restaurantData.email}
                    onChange={(e) => setRestaurantData({ ...restaurantData, email: e.target.value })}
                    placeholder="contact@restaurant.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  value={restaurantData.currency}
                  onChange={(e) => setRestaurantData({ ...restaurantData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                >
                  <option value="GNF">Franc Guinéen (GNF)</option>
                  <option value="FCFA">Franc CFA (FCFA)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                </select>
              </div>

              <button
                onClick={handleSaveRestaurant}
                disabled={saving}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* Onglet Catégories */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Tag size={24} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Catégories de produits</h2>
                  <p className="text-sm text-gray-500">Gérez les catégories de votre menu</p>
                </div>
              </div>
              <button
                onClick={() => openCategoryModal()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Nouvelle catégorie
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftWidth: '4px', borderLeftColor: category.color }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openCategoryModal(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Edit2 size={14} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Tag size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucune catégorie. Créez-en une pour commencer.</p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Profil */}
        {activeTab === 'profile' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Mon profil</h2>
                <p className="text-sm text-gray-500">Gérez vos informations personnelles</p>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <Shield size={28} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{profile?.full_name}</div>
                    <div className="text-sm text-gray-500">{profile?.email}</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">Administrateur</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* Onglet Sécurité */}
        {activeTab === 'security' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Lock size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Sécurité</h2>
                <p className="text-sm text-gray-500">Changez votre mot de passe</p>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Conseil :</strong> Utilisez un mot de passe fort avec au moins 8 caractères, incluant des lettres, chiffres et symboles.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel *
                </label>
                <input
                  type="password"
                  value={securityData.current_password}
                  onChange={(e) => setSecurityData({ ...securityData, current_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe *
                </label>
                <input
                  type="password"
                  value={securityData.new_password}
                  onChange={(e) => setSecurityData({ ...securityData, new_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  type="password"
                  value={securityData.confirm_password}
                  onChange={(e) => setSecurityData({ ...securityData, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={saving || !securityData.current_password || !securityData.new_password}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Lock size={18} />
                {saving ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Catégorie */}
      <Modal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Ex: Plats principaux"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icône
              </label>
              <select
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              >
                <option value="🍽️">🍽️ Plat</option>
                <option value="🍕">🍕 Pizza</option>
                <option value="🍔">🍔 Burger</option>
                <option value="🍗">🍗 Poulet</option>
                <option value="🍖">🍖 Viande</option>
                <option value="🐟">🐟 Poisson</option>
                <option value="🍜">🍜 Soupe</option>
                <option value="🍝">🍝 Pâtes</option>
                <option value="🍚">🍚 Riz</option>
                <option value="🥗">🥗 Salade</option>
                <option value="🍰">🍰 Dessert</option>
                <option value="🍹">🍹 Boisson</option>
                <option value="☕">☕ Café</option>
                <option value="🍺">🍺 Bière</option>
                <option value="🥤">🥤 Soda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                className="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={saving || !categoryForm.name.trim()}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {saving ? 'Enregistrement...' : editingCategory ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
