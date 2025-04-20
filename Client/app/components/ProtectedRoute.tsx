import type React from "react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { token } = useAuth();
	const location = useLocation();
	const [shouldRedirect, setShouldRedirect] = useState(false);

	useEffect(() => {
		if (!token) {
			setShouldRedirect(true);
		}
	}, [token]);

	if (shouldRedirect) {
		// Only redirect after initial render when we detect no token
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	return <>{children}</>;
}
