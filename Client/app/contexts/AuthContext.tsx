import type React from 'react';
import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const AuthContext = createContext<{
  token: string;
  onLogin: (authCallback: () => Promise<string>) => Promise<void>;
  onLogout: () => void;
}>({
  token: '',
  onLogin: async () => { },
  onLogout: () => { },
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  const handleLogin = async (authCallback: () => Promise<string>) => {
    const token = await authCallback();

    setToken(token);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setToken('');
  };

  const value = {
    token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
