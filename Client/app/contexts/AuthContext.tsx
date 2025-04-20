import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

interface AuthContextType {
  token: string;
  setToken: (token: string) => void;
  onLogout: () => void;
}

const AuthContext = createContext<AuthContextType | null>({
  token: '',
  setToken: () => {},
  onLogout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');

  const handleLogout = () => {
    console.log('Logging out');
    setToken('');
  };

  const value = {
    token,
    setToken,
    onLogout: handleLogout,
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
