import { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

const AuthContext = createContext<{
  isAuth: boolean;
  userId: string | undefined;
  onLogin: (token: string, userId: string) => void;
  onLogout: () => void;
}>({
  isAuth: false,
  userId: undefined,
  onLogin: () => {},
  onLogout: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId || undefined;
  });

  const handleLogin = async (token: string, userId: string) => {
    if (!token) {
      throw new Error('Token is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    setToken(token);
    setUserId(userId);

    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);

    const origin = location.state?.from?.pathname || '/dashboard';

    navigate(origin);
  };

  const handleLogout = () => {
    setToken('');
    setUserId(undefined);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const value = {
    isAuth: Boolean(token && userId),
    userId,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
