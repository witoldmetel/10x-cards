import { createBrowserRouter } from 'react-router';
import ArchivedFlashcards from './ArchivedFlashcards';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword';
import LandingPage from './LandingPage';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';
import UserSettings from './UserSettings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/settings',
    element: <UserSettings />,
  },
  {
    path: '/archived',
    element: <ArchivedFlashcards />,
  },
]);
