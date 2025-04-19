import React, { createContext, useContext, useEffect, useState } from "react";

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

// Storage key for auth data
const AUTH_STORAGE_KEY = "flashcards_auth";

// API endpoints
const API_BASE_URL = "http://localhost:5001/api"; // Make sure this matches your backend URL
const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login`,
  register: `${API_BASE_URL}/users/register`,
  resetPassword: `${API_BASE_URL}/users/forgot-password`,
  updatePassword: `${API_BASE_URL}/users/reset-password`,
};

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
    console.log("Making login request to:", API_ENDPOINTS.login);
    console.log("Request payload:", { email, password: "***" });

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);
      console.log(
        "Login response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Login error response:", error);
        throw new Error(error.message || "Failed to sign in");
      }

      const data = await response.json();
      console.log("Login successful, received data:", {
        ...data,
        token: "***",
      });

      const newSession = {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        token: data.token,
      };

      setSession(newSession);
      setUser(newSession.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    } catch (error) {
      console.error("Login request failed:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("Making registration request to:", API_ENDPOINTS.register);

    const response = await fetch(API_ENDPOINTS.register, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("Registration response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to create account");
    }

    const data = await response.json();
    console.log("Registration successful, received data:", {
      ...data,
      token: "***",
    });

    const newSession = {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      token: data.token,
    };

    setSession(newSession);
    setUser(newSession.user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const resetPassword = async (email: string) => {
    const response = await fetch(API_ENDPOINTS.resetPassword, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reset password");
    }
  };

  const updatePassword = async (password: string) => {
    if (!session?.token) {
      throw new Error("No active session");
    }

    const response = await fetch(API_ENDPOINTS.updatePassword, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ newPassword: password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update password");
    }
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
