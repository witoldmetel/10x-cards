import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
};

type Session = {
  user: User;
  token: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock storage key
const AUTH_STORAGE_KEY = 'flashcards_auth';

// Mock user database
const mockUsers = new Map<string, { password: string; user: User }>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      setSession(parsedAuth);
      setUser(parsedAuth.user);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userRecord = mockUsers.get(email);
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password');
    }

    const newSession = {
      user: userRecord.user,
      token: `mock-token-${Date.now()}`,
    };

    setSession(newSession);
    setUser(userRecord.user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
  };

  const signUp = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (mockUsers.has(email)) {
      throw new Error('Email already in use');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
    };

    mockUsers.set(email, { password, user: newUser });

    const newSession = {
      user: newUser,
      token: `mock-token-${Date.now()}`,
    };

    setSession(newSession);
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
  };

  const signOut = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    setSession(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const resetPassword = async (email: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!mockUsers.has(email)) {
      throw new Error('No account found with this email');
    }

    // In a real app, this would send an email
    console.log(`Password reset requested for ${email}`);
  };

  const updatePassword = async (password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!user) {
      throw new Error('No user logged in');
    }

    const userRecord = mockUsers.get(user.email);
    if (!userRecord) {
      throw new Error('User not found');
    }

    mockUsers.set(user.email, { ...userRecord, password });
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
