import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function ProtectedLayout() {
  const { isAuth } = useAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to='/' replace state={{ from: location }} />;
  }

  return (
    <div className='app-shell'>
      <Header />
      <main className='container mx-auto py-8 flex-1'>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
