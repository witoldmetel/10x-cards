import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Save } from 'lucide-react';

export default function UserSettings() {

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);



  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='max-w-lg mx-auto'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>Account Settings</h1>

          <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Profile Information</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Email</label>
                <p className='mt-1 text-gray-900'>{'user?.email'}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Change Password</h2>
            <form onSubmit={() => {}} className='space-y-4'>
              <div>
                <label htmlFor='new-password' className='block text-sm font-medium text-gray-700'>
                  New Password
                </label>
                <input
                  type='password'
                  id='new-password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor='confirm-password' className='block text-sm font-medium text-gray-700'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  id='confirm-password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                  minLength={6}
                  required
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type='submit'
                disabled={isLoading}
                className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className='flex items-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  <>
                    <Save className='w-5 h-5 mr-2' />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
