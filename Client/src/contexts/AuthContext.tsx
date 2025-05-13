import { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AuthResponse, User } from '@/api/user/types';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext<{
  isAuth: boolean;
  user: User | null;
  onLogin: (data: AuthResponse) => void;
  onLogout: () => void;
}>({
  isAuth: false,
  user: null,
  onLogin: () => {},
  onLogout: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (data: AuthResponse) => {
    if (!data.token) {
      throw new Error('Token is required');
    }
    
    if (!data.user.userId) {
      throw new Error('User ID is required');
    }

    setToken(data.token);
    setUser(data.user);

    localStorage.setItem('token', data.token);

    // Invalidate all queries to force fresh data fetch
    await queryClient.invalidateQueries();

    const origin = location.state?.from?.pathname || '/dashboard';

    navigate(origin);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    
    // Clear all queries on logout
    queryClient.clear();
    
    navigate('/');
  };

  const value = {
    isAuth: Boolean(token),
    user,
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
