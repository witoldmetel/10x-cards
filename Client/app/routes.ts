import { type RouteConfig, route, index, layout, prefix } from '@react-router/dev/routes';

export default [
  index('routes/LandingPage.tsx'),

  layout('routes/AuthLayout.tsx', [
    route('login', 'routes/auth/Login.tsx'),
    route('register', 'routes/auth/Register.tsx'),
    route('forgot-password', 'routes/auth/ForgotPassword.tsx'),
    route('reset-password', 'routes/auth/ResetPassword.tsx'),
  ]),

  layout('routes/ProtectedLayout.tsx', [
    ...prefix('dashboard', [index('routes/Dashboard.tsx'), route('archived', 'routes/ArchivedFlashcards.tsx')]),
    route('settings', 'routes/UserSettings.tsx'),
  ]),
] satisfies RouteConfig;
