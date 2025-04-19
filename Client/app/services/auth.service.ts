import { useState, useCallback } from 'react';
import type { Session, User } from '@/types/auth';

const AUTH_TOKEN_KEY = 'flashcards_auth_token';
const USER_DATA_KEY = 'flashcards_user';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userData = localStorage.getItem(USER_DATA_KEY);
    const user = userData ? JSON.parse(userData) : null;

    if (!token || !user) {
      return null;
    }

    return { token, user };
  });

  const setToken = useCallback((token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }, []);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }, []);

  const setUser = useCallback((user: User) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }, []);

  const getUser = useCallback((): User | null => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }, []);

  const updateSession = useCallback(
    (newSession: Session) => {
      setToken(newSession.token);
      setUser(newSession.user);
      setSession(newSession);
    },
    [setToken, setUser],
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setSession(null);
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!getToken();
  }, [getToken]);

  const signOut = useCallback(async () => {
    try {
      // Here you would typically make an API call to invalidate the token on the server
      // For now, we'll just clear the local session
      clearSession();
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [clearSession]);

  return {
    session,
    setToken,
    getToken,
    setUser,
    getUser,
    updateSession,
    clearSession,
    isAuthenticated,
    signOut
  };
}
