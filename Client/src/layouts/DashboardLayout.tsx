import { Link, Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Home, Plus, Settings, LogOut, Archive, Menu, X, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/tailwind';

export default function DashboardLayout() {
  const { isAuth, onLogout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!isAuth) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Create Flashcards', href: '/flashcards/options', icon: Plus },
    { name: 'Archive', href: '/collections/archive', icon: Archive },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-background'>
      {/* Mobile Header */}
      <header className='md:hidden border-b px-4 py-3 flex items-center justify-between bg-card'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label='Toggle menu'>
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <Brain className='h-8 w-8 text-blue-600' />
        </div>
        <Avatar className='h-8 w-8'>
          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background md:hidden transition-transform duration-300 transform',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
        <div className='flex flex-col h-full p-4'>
          <div className='flex items-center justify-between mb-8'>
            <Brain className='h-8 w-8 text-blue-600' />
            <Button variant='ghost' size='icon' onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          <nav className='space-y-1 flex-1'>
            {navigationItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium',
                  isActive(item.href) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                )}>
                <item.icon size={18} className='mr-3' />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className='mt-auto pt-4 border-t'>
            <div className='px-3 py-2 text-sm font-medium text-muted-foreground mb-2'>{user?.email}</div>
            <Button
              variant='ghost'
              className='w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={onLogout}
              data-testid="mobile-logout-button">
              <LogOut size={18} className='mr-3' />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className='hidden md:flex md:w-64 md:flex-col h-screen sticky top-0 border-r'>
        <div className='flex flex-col flex-1 bg-card'>
          <div className='px-4 py-5 flex items-center'>
            <Brain className='h-8 w-8 text-blue-600' />
          </div>
          <nav className='flex-1 px-2 py-4 space-y-1'>
            {navigationItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium',
                  isActive(item.href) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                )}>
                <item.icon size={18} className='mr-3' />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className='px-2 py-4 border-t'>
            <div className='flex items-center px-3 py-2'>
              <Avatar className='h-8 w-8 mr-3'>
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className='flex-1 overflow-hidden'>
                <p className='text-sm font-medium truncate'>{user?.name}</p>
                <p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
              </div>
            </div>
            <Button
              variant='ghost'
              className='w-full justify-start mt-2 text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={onLogout}
              data-testid="desktop-logout-button">
              <LogOut size={18} className='mr-3' />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1'>
        <div className='py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
