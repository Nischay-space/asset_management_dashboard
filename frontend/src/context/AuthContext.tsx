import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as loginApi } from '../api/auth';
import { decodeToken } from '../utils/jwt';
import { getStoredToken, setStoredToken, clearStoredToken } from '../utils/tokenStorage';

interface AuthContextType {
  token: string | null;
  role: string | null;
  name: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());

  async function login(email: string, password: string, remember: boolean) {
    const result = await loginApi(email, password);
    setStoredToken(result.access_token, remember);
    setToken(result.access_token);
  }

  function logout() {
    clearStoredToken();
    setToken(null);
  }

  const decoded = token ? decodeToken(token) : null;

  const value: AuthContextType = {
    token,
    role: decoded?.role ?? null,
    name: decoded?.name ?? null,
    isAuthenticated: token !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}