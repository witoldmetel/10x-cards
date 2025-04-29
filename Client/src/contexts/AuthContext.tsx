import { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';



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


  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  const handleLogin = async (token: string) => {
    if (!token) {
      throw new Error('Token is required');
    }

    setToken(token);

    localStorage.setItem('token', token);

    const origin = location.state?.from?.pathname || '/dashboard';
    navigate(origin);
  };

  const handleLogout = () => {
    setToken('');

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
