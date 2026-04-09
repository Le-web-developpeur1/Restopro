import { useEffect, useState } from 'react';
import { Search, RefreshCw, Calendar, Info } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../lib/types';
import { formatCurrency, formatDate, getPaymentLabel } from '../lib/utils';
import LoadingSpinner from '../components/shared/LoadingSpinner';

type FilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year';

export default function History() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Initialiser le mois et l'année actuels
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    setSelectedYear(String(now.getFullYear()));
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
    setLoading(false);
  }

  function filterByDate(order: Order): boolean {
    const orderDate = new Date(order.created_at || order.createdAt || '');
    const now = new Date();

    switch (filterPeriod) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return orderDate >= today;

      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Dimanche
        startOfWeek.setHours(0, 0, 0, 0);
        return orderDate >= startOfWeek;

      case 'month':
        if (!selectedMonth) return true;
        const [year, month] = selectedMonth.split('-').map(Number);
        return orderDate.getFullYear() === year && orderDate.getMonth() === month - 1;

      case 'year':
        if (!selectedYear) return true;
        return orderDate.getFullYear() === parseInt(selectedYear);

      default:
        return true;
    }
  }

  const filteredOrders = orders
    .filter((o) => o.order_number.toLowerCase().includes(search.toLowerCase()))
    .filter(filterByDate)
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || '').getTime();
      const dateB = new Date(b.created_at || b.createdAt || '').getTime();
      return dateB - dateA;
    });

  const totalRevenue = filteredOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  // Générer les années disponibles
  const availableYears = Array.from(
    new Set(orders.map(o => new Date(o.created_at || o.createdAt || '').getFullYear()))
  ).sort((a, b) => b - a);

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
          <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredOrders.length} commande(s) - {formatCurrency(totalRevenue)} de CA
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {/* Info pour les caissiers
      {profile?.role === 'caissier' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Note :</strong> Vous ne voyez que les ventes que vous avez enregistrées. L'administrateur peut voir toutes les ventes du restaurant.
          </div>
        </div>
      )} */}

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Période rapide */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Par mois</option>
              <option value="year">Par année</option>
            </select>
          </div>

          {/* Sélection du mois */}
          {filterPeriod === 'month' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mois
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Sélection de l'année */}
          {filterPeriod === 'year' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {/* Recherche */}
          <div className={filterPeriod === 'all' || filterPeriod === 'today' || filterPeriod === 'week' ? 'md:col-span-3' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par numéro..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Aucune commande trouvée
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900">{order.order_number}</div>
                  <div className="text-sm text-gray-500">{formatDate(order.created_at || order.createdAt || '')}</div>
                  {order.table_number && (
                    <div className="text-xs text-gray-400 mt-1">Table: {order.table_number}</div>
                  )}
                  {order.payment_method && (
                    <div className="text-xs text-gray-400">{getPaymentLabel(order.payment_method)}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status === 'completed' ? 'Complétée' :
                     order.status === 'cancelled' ? 'Annulée' : 'En attente'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
