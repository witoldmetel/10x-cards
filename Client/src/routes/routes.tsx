import { Routes, Route } from 'react-router';

import LandingPage from './LandingPage';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Dashboard from './Dashboard';
import Archive from './Archive';
import Settings from './Settings';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedLayout from '@/layouts/ProtectedLayout';
import ManualGenerate  from './ManualGenerate';
import AIGenerate from './AIGenerate';
import CollectionDetails from './CollectionDetails';

export const routes = (
  <Routes>
    <Route index element={<LandingPage />} />

    <Route element={<AuthLayout />}>
      <Route path='login' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path='forgot-password' element={<ForgotPassword />} />
      <Route path='reset-password' element={<ResetPassword />} />
    </Route>

    <Route element={<ProtectedLayout />}>
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='archive' element={<Archive />} />
      <Route path='generate/ai' element={<AIGenerate />} />
      <Route path='generate/manual' element={<ManualGenerate />} />
      <Route path='collections/:collectionId' element={<CollectionDetails />} />
      <Route path='settings' element={<Settings />} />
    </Route>

    <Route path='*' element={<div>404</div>} />
  </Routes>
);

export default routes;
