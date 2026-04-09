import { useEffect, useState } from 'react';
import { UserPlus, Pencil, Trash2, Shield, User as UserIcon, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Profile, UserRole } from '../lib/types';
import { getRoleBadge, formatDate } from '../lib/utils';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Users() {
  const { profile } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'serveur' as UserRole
  });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.getUsers();
      const usersData = (data as any[]).map(user => ({
        id: user.id || user._id,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        email: user.email,
        created_at: user.created_at || user.createdAt,
        createdAt: user.createdAt || user.created_at,
        updated_at: user.updated_at || user.updatedAt,
        updatedAt: user.updatedAt || user.updated_at
      }));
      setUsers(usersData as Profile[]);
    } catch (error: any) {
      console.error('Erreur chargement utilisateurs:', error);
    }
    setLoading(false);
  }

  function openCreateModal() {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'serveur'
    });
    setError('');
    setModalOpen(true);
  }

  function openEditModal(user: Profile) {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      full_name: user.full_name,
      role: user.role
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      if (editingUser) {
        // Mise à jour
        const updateData: any = {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role
        };
        
        // Ajouter le mot de passe seulement s'il est fourni
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.updateUser(editingUser.id, updateData);
      } else {
        // Création
        if (!formData.password) {
          setError('Le mot de passe est requis pour créer un utilisateur');
          setProcessing(false);
          return;
        }
        await api.createUser(formData);
      }

      setModalOpen(false);
      await loadUsers();
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
    }

    setProcessing(false);
  }

  async function handleDelete(user: Profile) {
    if (user.id === profile?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.full_name} ?`)) {
      return;
    }

    try {
      await api.deleteUser(user.id);
      toast.success('Utilisateur supprimé');
      await loadUsers();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">Gérer les comptes utilisateurs</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <UserPlus size={18} />
          Nouvel utilisateur
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <UserIcon size={20} className="text-amber-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.full_name}</div>
                        {user.id === profile?.id && (
                          <div className="text-xs text-amber-600">Vous</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const badge = getRoleBadge(user.role);
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {user.createdAt ? formatDate(user.createdAt) : user.created_at ? formatDate(user.created_at) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      {user.id !== profile?.id && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-400"
              placeholder="Ex: Mamadou Diallo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-400"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe {editingUser && '(laisser vide pour ne pas changer)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-400"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-400"
            >
              <option value="serveur">Serveur</option>
              <option value="caissier">Caissier</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              {processing ? 'Traitement...' : editingUser ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
