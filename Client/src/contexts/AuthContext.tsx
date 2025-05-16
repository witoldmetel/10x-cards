import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AuthResponse, User } from '@/api/user/types';
import { useQueryClient } from '@tanstack/react-query';
import { getUserById } from '@/api/user/api';
import { instance } from '@/lib/axios';
import { toast } from 'sonner';

const AuthContext = createContext<{
  isAuth: boolean;
  user: User | null;
  onLogin: (data: AuthResponse) => void;
  onLogout: () => void;
  updateUserData: (user: User) => void;
}>({
  isAuth: false,
  user: null,
  onLogin: () => {},
  onLogout: () => {},
  updateUserData: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        handleLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    if (!token) {
      handleLogout();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        try {
          const storedUser = localStorage.getItem('user');
          const userData = storedUser ? JSON.parse(storedUser) : null;

          if (userData?.userId) {
            const freshUserData = await getUserById(userData.userId);
            setUser(freshUserData);
            localStorage.setItem('user', JSON.stringify(freshUserData));
          } else {
            handleLogout();
          }
        } catch (error) {
          handleLogout();
        }
      }
    };

    initializeAuth();
  }, [token]);

  useEffect(() => {
    const interceptor = instance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          handleLogout();
          toast.error('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      },
    );

    return () => {
      instance.interceptors.response.eject(interceptor);
    };
  }, []);

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
    localStorage.setItem('user', JSON.stringify(data.user));

    await queryClient.invalidateQueries();

    const origin = location.state?.from?.pathname || '/dashboard';
    navigate(origin);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    queryClient.clear();

    navigate('/login');
  };

  const updateUserData = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    isAuth: Boolean(token),
    user,
    onLogin: handleLogin,
    onLogout: handleLogout,
    updateUserData,
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
