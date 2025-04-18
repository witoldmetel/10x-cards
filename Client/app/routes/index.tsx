import { Routes, Route, Navigate } from "react-router";
import ArchivedFlashcards from "./ArchivedFlashcards";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";
import UserSettings from "./UserSettings";
import AuthLayout from "./AuthLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route index element={<LandingPage />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected routes */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="settings" element={<UserSettings />} />
      <Route path="archived" element={<ArchivedFlashcards />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
