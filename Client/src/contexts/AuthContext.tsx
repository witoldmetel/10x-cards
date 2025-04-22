import { createContext, useContext, useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to='/' replace state={{ from: location }} />;
  }

  return children;
};

const AuthContext = createContext<{
  token: string;
  onLogin: (token: string) => void;
  onLogout: () => void;
}>({
  token: '',
  onLogin: () => {},
  onLogout: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  const handleLogin = async (token: string) => {
    if (!token) {
      throw new Error('Token is required');
    }

    setToken(token);
    // Store token in localStorage
    localStorage.setItem('token', token);

    const origin = location.state?.from?.pathname || '/dashboard';
    navigate(origin);
  };

  const handleLogout = () => {
    setToken('');
    // Remove token from localStorage
    localStorage.removeItem('token');
    navigate('/');
  };

  const value = {
    token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
