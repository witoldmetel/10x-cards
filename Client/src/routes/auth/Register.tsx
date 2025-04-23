import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onLogin } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Store in localStorage
      const session = {
        user: {
          id: data.id ,
          email: data.email ,
        },
        token: data.token,
      };

      // Validate required data
      if (!session.user.id || !session.user.email || !session.token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('flashcards_auth', JSON.stringify(session));


      onLogin(session.token);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link
          to='/'
          className='absolute top-8 left-8 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to home
        </Link>

        <h2 className='text-center text-4xl font-bold text-gray-900 mb-2'>Create your account</h2>
        <p className='text-center text-lg text-gray-600'>
          Already have an account?{' '}
          <Link to='/login' className='font-medium text-blue-600 hover:text-blue-700'>
            Sign in
          </Link>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <Card>
          <CardHeader>
            {error && (
              <div className='mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>{error}</div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email address</Label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' />
                  </div>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    className='pl-10'
                    placeholder='you@example.com'
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <Input id='password' name='password' type='password' className='pl-10' minLength={6} required />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Confirm Password</Label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <Input
                    id='confirm-password'
                    name='confirm-password'
                    type='password'
                    className='pl-10'
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
