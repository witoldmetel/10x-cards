import React from 'react';
import { Link, useNavigate, useNavigation, useActionData, Form, redirect } from 'react-router';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import type { Route } from './+types/Login';

// Cannot use hooks in action function
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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
      return {
        ok: false,
        error: data.message || 'Failed to sign in',
      };
    }

    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': `token=${data.token}; Path=/; HttpOnly`,
      },
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to sign in',
    };
  }
}

export default function Login() {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData<{ ok: boolean; error?: string; data?: Route.LoginResponse }>();
  const isLoading = navigation.state === 'submitting';

  // Handle successful login
  React.useEffect(() => {
    if (actionData?.ok && actionData.data) {
      const { token } = actionData.data;
      setToken(token);
      navigate('/dashboard');
    }
  }, [actionData, setToken, navigate]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link
          to='/'
          className='absolute top-8 left-8 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors'
        >
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
            {actionData?.error && (
              <div className='mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
                {actionData.error}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Form method='post' className='space-y-6'>
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
                <Link to='/forgot-password' className='text-sm font-medium text-blue-600 hover:text-blue-700'>
                  Forgot your password?
                </Link>
              </div>

              <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
