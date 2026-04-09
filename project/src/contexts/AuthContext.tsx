import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import { Profile } from '../lib/types';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile() {
    try {
      const data = await api.getProfile();
      const profileData = data as any;
      setProfile({
        id: profileData.id || profileData._id,
        full_name: profileData.full_name,
        role: profileData.role,
        avatar_url: profileData.avatar_url,
        email: profileData.email,
        created_at: profileData.created_at || profileData.createdAt,
        createdAt: profileData.createdAt || profileData.created_at,
        updated_at: profileData.updated_at || profileData.updatedAt,
        updatedAt: profileData.updatedAt || profileData.updated_at
      } as Profile);
      setUser({ id: profileData.id || profileData._id, email: profileData.email || '' });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      setProfile(null);
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile();
  }

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      const response = await api.login(email, password);
      localStorage.setItem('auth_token', response.token);
      setUser({ id: response.user.id, email: response.user.email });
      setProfile(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Erreur de connexion' };
    }
  }

  async function signOut() {
    localStorage.removeItem('auth_token');
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
