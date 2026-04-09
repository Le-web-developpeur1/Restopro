import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Menu from './pages/Menu';
import History from './pages/History';
import Settings from './pages/Settings';
import Users from './pages/Users';
import LoadingSpinner from './components/shared/LoadingSpinner';

type Page = 'dashboard' | 'pos' | 'menu' | 'history' | 'users' | 'settings';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('pos');

  // Redirection automatique selon le rôle
  useEffect(() => {
    if (profile) {
      if (profile.role === 'caissier') {
        setCurrentPage('pos'); // Caissier commence sur POS
      } else if (profile.role === 'admin') {
        setCurrentPage('dashboard'); // Admin commence sur Dashboard
      } else {
        setCurrentPage('pos'); // Serveur commence sur POS
      }
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  function renderPage() {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'menu': return <Menu />;
      case 'history': return <History />;
      case 'users': return <Users />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}
