import { Archive, LayoutDashboard, Settings } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from 'src/contexts/AuthContext';

export function Navbar() {
  const { onLogout } = useAuth();

  return (
    <nav className='bg-white shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <Link to='/dashboard' className='flex items-center px-4 text-gray-900 hover:text-blue-600'>
              <LayoutDashboard className='w-5 h-5 mr-2' />
              Dashboard
            </Link>
            <Link to='/archived' className='flex items-center px-4 text-gray-900 hover:text-blue-600'>
              <Archive className='w-5 h-5 mr-2' />
              Archived
            </Link>
          </div>
          <div className='flex items-center'>
            <Link to='/settings' className='flex items-center px-4 text-gray-900 hover:text-blue-600'>
              <Settings className='w-5 h-5 mr-2' />
              Settings
            </Link>
            <button type='button' onClick={onLogout} className='border rounded px-2.5 py-1 cursor-pointer hover:text-blue-600'>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
