import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Brain } from 'lucide-react';
import { Link, Navigate } from 'react-router';
import { Outlet } from 'react-router';

export default function AuthLayout() {
  const { isAuth } = useAuth();

  if (isAuth) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      {/* Header from Landing Page */}
      <header className='border-b bg-card'>
        <div className='container mx-auto flex justify-between items-center py-4'>
          <Link to='/'>
            <Brain className='h-8 w-8 text-blue-600' />
          </Link>
          <div className='flex items-center gap-4'>
            <Link to='/login'>
              <Button variant='ghost'>Sign in</Button>
            </Link>
            <Link to='/register'>
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex items-center justify-center p-4 sm:p-8'>
        <div
          className='max-w-md w-full bg-white p-8 rounded-lg shadow-sm'
          style={{ opacity: 1, visibility: 'visible' }}>
          <Outlet />
        </div>
      </div>

      {/* Footer from Landing Page */}
      <footer className='bg-muted py-8'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='mb-4 md:mb-0'>
              <p className='text-sm text-muted-foreground'>© 2025 10x Cards. All rights reserved.</p>
            </div>
            <div className='flex gap-6'>
              <a href='#' className='text-sm text-muted-foreground hover:text-foreground'>
                Privacy Policy
              </a>
              <a href='#' className='text-sm text-muted-foreground hover:text-foreground'>
                Terms of Service
              </a>
              <a href='#' className='text-sm text-muted-foreground hover:text-foreground'>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
