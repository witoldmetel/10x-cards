import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router';
import { Outlet } from 'react-router';

export default function AuthLayout() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
      <Outlet />
    </div>
  );
}
