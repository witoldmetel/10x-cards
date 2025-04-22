import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onLogin } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    try {
      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      onLogin(data.token);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link
          to='/'
          className='absolute top-8 left-8 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to home
        </Link>

        <h2 className='text-center text-4xl font-bold text-gray-900 mb-2'>Welcome back</h2>
        <p className='text-center text-lg text-gray-600'>
          Don't have an account?{' '}
          <Link to='/register' className='font-medium text-blue-600 hover:text-blue-700'>
            Sign up
          </Link>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <Card>
          <CardHeader>
            {error && <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4'>{error}</div>}
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
                  <Input id='password' name='password' type='password' className='pl-10' required />
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <Link
                  to='#'
                  className='text-sm font-medium text-gray-400 cursor-not-allowed '
                  onClick={e => e.preventDefault()}>
                  Forgot your password?
                </Link>
              </div>

              <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
