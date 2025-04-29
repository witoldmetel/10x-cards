import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Brain, Menu, User, LogOut, Plus, Home, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { cn } from '@/lib/tailwind';

export default function Header() {
  const { isAuth, onLogout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className='sticky top-0 z-10 bg-white border-b border-neutral-200 shadow-sm'>
      <div className='container mx-auto'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2'>
            <Brain className='h-8 w-8 text-primary-600' />
            <span className='text-xl font-bold hidden sm:block'>10xCards</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-4'>
            {isAuth && (
              <>
                <NavLink to='/dashboard'>Dashboard</NavLink>
                <NavLink to='/archived'>Archived</NavLink>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className='flex items-center gap-2'>
            {isAuth ? (
              <>
                <Button variant='ghost' className='md:hidden' onClick={toggleMenu} aria-label='Menu'>
                  <Menu className='h-5 w-5' />
                </Button>
                <div className='relative hidden md:block'>
                  <Button
                    variant='outline'
                    className='rounded-full w-9 h-9 p-0'
                    onClick={toggleMenu}
                    aria-label='User menu'>
                    <User className='h-5 w-5' />
                  </Button>

                  {isMenuOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-neutral-200'>
                      <Link
                        to='/settings'
                        className='block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'
                        onClick={closeMenu}>
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          closeMenu();
                          onLogout();
                        }}
                        className='block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100'>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant='outline' onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant='primary' onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && isAuth && (
        <div className='md:hidden bg-white border-t border-neutral-200 py-2'>
          <div className='container mx-auto'>
            <nav className='flex flex-col space-y-1'>
              <NavLink to='/dashboard' onClick={closeMenu} className='flex items-center gap-2 py-2'>
                <Home className='h-5 w-5' />
                Dashboard
              </NavLink>
              <NavLink to='/create' onClick={closeMenu} className='flex items-center gap-2 py-2'>
                <Plus className='h-5 w-5' />
                Create
              </NavLink>
              <NavLink to='/generate' onClick={closeMenu} className='flex items-center gap-2 py-2'>
                <Brain className='h-5 w-5' />
                AI Generate
              </NavLink>
              <NavLink to='/settings' onClick={closeMenu} className='flex items-center gap-2 py-2'>
                <Settings className='h-5 w-5' />
                Settings
              </NavLink>
              <button
                onClick={() => {
                  closeMenu();
                  onLogout();
                }}
                className='flex items-center gap-2 py-2 text-left w-full text-neutral-700'>
                <LogOut className='h-5 w-5' />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function NavLink({ to, children, className, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn('font-medium text-neutral-700 hover:text-primary-600 transition-colors', className)}
      onClick={onClick}>
      {children}
    </Link>
  );
}
