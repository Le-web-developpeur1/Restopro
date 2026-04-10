import { LayoutDashboard, UtensilsCrossed, ShoppingCart, History, Users, Settings, LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRestaurant } from '../../contexts/RestaurantContext';

type Page = 'dashboard' | 'pos' | 'menu' | 'history' | 'users' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard; roles: string[] }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin'] },
  { id: 'pos', label: 'Caisse / POS', icon: ShoppingCart, roles: ['admin', 'caissier', 'serveur'] },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, roles: ['admin'] },
  { id: 'history', label: 'Historique', icon: History, roles: ['admin', 'caissier'] },
  { id: 'users', label: 'Utilisateurs', icon: Users, roles: ['admin'] },
  { id: 'settings', label: 'Paramètres', icon: Settings, roles: ['admin', 'caissier', 'serveur'] },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const { restaurant } = useRestaurant();

  const visibleItems = navItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {restaurant?.logo ? (
            <img 
              src={restaurant.logo} 
              alt={restaurant.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <ChefHat size={30} className="text-white" />
            </div>
          )}
          <div>
            <div className="font-bold text-lg leading-tight">{restaurant?.name || 'Resto Singa'}</div>
            <div className="text-xs text-gray-400">Système de caisse</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                active
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <span className="text-amber-400 font-bold text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{profile?.full_name}</div>
            <div className="text-xs text-gray-400 capitalize">{profile?.role}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
