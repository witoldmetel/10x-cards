import { Routes, Route } from "react-router";
import ArchivedFlashcards from "./ArchivedFlashcards";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";
import UserSettings from "./UserSettings";
import AuthLayout from "../layouts/AuthLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route index element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="dashboard" element={<Dashboard />} />
      <Route path="settings" element={<UserSettings />} />
      <Route path="archived" element={<ArchivedFlashcards />} />
    </Routes>
  );
};
