import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Calendar, Award, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/utils';
import LoadingSpinner from '../components/shared/LoadingSpinner';

interface Stats {
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  monthOrders: number;
  topProducts: { name: string; count: number; revenue: number }[];
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders()
      ]);

      const recentCompleted = (ordersData as Order[])
        .filter((o: Order) => o.status === 'completed')
        .slice(0, 8);

      setStats({
        todayRevenue: statsData.today_revenue || 0,
        todayOrders: statsData.today_orders || 0,
        monthRevenue: statsData.month_revenue || 0,
        monthOrders: statsData.month_orders || 0,
        topProducts: statsData.top_products || []
      });

      setRecentOrders(recentCompleted);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Ventes aujourd'hui",
      value: formatCurrency(stats?.todayRevenue || 0),
      sub: `${stats?.todayOrders || 0} commandes`,
      icon: TrendingUp,
      color: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Commandes du jour',
      value: `${stats?.todayOrders || 0}`,
      sub: 'transactions complétées',
      icon: ShoppingBag,
      color: 'from-blue-400 to-blue-600',
    },
    {
      label: 'Ventes du mois',
      value: formatCurrency(stats?.monthRevenue || 0),
      sub: `${stats?.monthOrders || 0} commandes`,
      icon: Calendar,
      color: 'from-emerald-400 to-green-600',
    },
    {
      label: 'Moy. par commande',
      value: stats?.todayOrders
        ? formatCurrency(Math.round((stats.todayRevenue || 0) / stats.todayOrders))
        : formatCurrency(0),
      sub: 'panier moyen',
      icon: Award,
      color: 'from-rose-400 to-red-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de votre restaurant</p>
      </div>

      {/* Message pour les caissiers */}
      {profile?.role === 'caissier' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">👋</div>
            <div>
              <div className="font-semibold text-amber-900">Bienvenue {profile.full_name} !</div>
              <div className="text-sm text-amber-700">Vous pouvez enregistrer des ventes depuis la page Caisse.</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.color} mb-4`}>
                <Icon size={22} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</div>
              <div className="text-sm text-gray-500 mt-1">{card.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Aucune vente enregistrée</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{order.order_number}</div>
                      <div className="text-xs text-gray-400">{formatDate(order.created_at || order.createdAt || '')}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Top produits du mois</h2>
          </div>
          {stats?.topProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Aucune donnée</div>
          ) : (
            <div className="space-y-3">
              {stats?.topProducts.map((product, idx) => (
                <div key={product.name} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{product.name}</div>
                    <div className="text-xs text-gray-400">{product.count} vendus</div>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600">{formatCurrency(product.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
