import { useLocation, Link } from 'react-router';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center max-w-md px-4'>
        <h1 className='text-6xl font-bold text-primary mb-4'>404</h1>
        <p className='text-2xl font-semibold mb-4'>Page not found</p>
        <p className='text-muted-foreground mb-8'>The page you are looking for doesn't exist or has been moved.</p>
        <Link to='/'>
          <Button className='mx-auto'>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
