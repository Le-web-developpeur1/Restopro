import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface RestaurantInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  logo: string;
}

interface RestaurantContextType {
  restaurant: RestaurantInfo | null;
  loading: boolean;
  refreshRestaurant: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRestaurant() {
    const token = localStorage.getItem('auth_token');
    
    // Ne charger que si l'utilisateur est connecté
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getRestaurantInfo();
      setRestaurant(data as RestaurantInfo);
    } catch (error) {
      console.error('Erreur chargement restaurant:', error);
      // Valeurs par défaut si erreur
      setRestaurant({
        name: 'RESTO SINGA',
        address: '',
        phone: '',
        email: '',
        currency: 'GNF',
        logo: ''
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    // Charger au démarrage
    loadRestaurant();

    // Écouter les changements de token (connexion/déconnexion)
    const handleStorageChange = () => {
      loadRestaurant();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Écouter aussi les changements locaux du token
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'auth_token') {
        loadRestaurant();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, refreshRestaurant: loadRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
