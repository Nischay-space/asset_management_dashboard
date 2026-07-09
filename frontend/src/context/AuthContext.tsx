import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as loginApi } from '../api/auth';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  async function login(email: string, password: string) {
    const result = await loginApi(email, password);
    localStorage.setItem('token', result.access_token);
    setToken(result.access_token);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  const value: AuthContextType = {
    token,
    isAuthenticated: token !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}