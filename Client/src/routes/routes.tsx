import { Routes, Route } from 'react-router';

import LandingPage from './LandingPage';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Dashboard from './Dashboard';
import Archive from './collections/Archive';
import Settings from './Settings';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ManualGenerate from './flashcards/ManualGenerate';
import AIGenerate from './flashcards/AIGenerate';
import CollectionDetails from './collections/CollectionDetails';
import NotFound from './NotFound';
import CreateFlashcardsOptions from './flashcards/CreateFlashcardsOptions';
import PendingReview from './flashcards/PendingReview';

export const routes = (
  <Routes>
    {/* Public Routes */}
    <Route path='/' element={<LandingPage />} />

    {/* Auth Routes */}
    <Route element={<AuthLayout />}>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
    </Route>

    {/* Protected Dashboard Routes */}
    <Route element={<DashboardLayout />}>
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/flashcards/options' element={<CreateFlashcardsOptions />} />
      <Route path='/flashcards/create' element={<ManualGenerate />} />
      <Route path='/flashcards/generate' element={<AIGenerate />} />
      <Route path='/flashcards/pending-review' element={<PendingReview />} />
      <Route path='/collections/:collectionId' element={<CollectionDetails />} />
      <Route path='/collections/archive' element={<Archive />} />
      <Route path='/settings' element={<Settings />} />
    </Route>

    {/* 404 Route */}
    <Route path='*' element={<NotFound />} />
  </Routes>
);

export default routes;
