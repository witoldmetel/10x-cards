import { Outlet } from 'react-router';

import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/contexts/AuthContext';

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <Navbar />
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
