import { AuthUser } from '@/api/client';
import * as SecureStore from 'expo-secure-store';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (userData: AuthUser, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app startup, check if a token was already saved from a previous session.
  useEffect(() => {
    async function loadStoredAuth() {
      const token = await SecureStore.getItemAsync('authToken');
      const savedUser = await SecureStore.getItemAsync('authUser');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }
    loadStoredAuth();
  }, []);

  async function signIn(userData: AuthUser, token: string) {
    await SecureStore.setItemAsync('authToken', token);
    await SecureStore.setItemAsync('authUser', JSON.stringify(userData));
    setUser(userData);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('authUser');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}