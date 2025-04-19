import React, { useState } from 'react';
import { Link } from 'react-router';

import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');




  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link
          to='/login'
          className='absolute top-8 left-8 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to login
        </Link>

        <h2 className='text-center text-4xl font-bold text-gray-900 mb-2'>Reset your password</h2>
        <p className='text-center text-lg text-gray-600'>
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <Card>
          <CardHeader>
            {error && (
              <div className='mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>{error}</div>
            )}
            {message && (
              <div className='mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md'>
                {message}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={() => {}} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email address</Label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' />
                  </div>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='pl-10'
                    placeholder='you@example.com'
                    required
                  />
                </div>
              </div>

              <Button type='submit' disabled={loading} className='w-full' size='lg'>
                {loading ? 'Sending...' : 'Send reset instructions'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
