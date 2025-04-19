import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Redirect to the login page with the current location
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
} 