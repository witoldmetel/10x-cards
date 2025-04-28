import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
    <div className='min-h-screen flex items-center justify-center bg-neutral-50'>
      <Link
        to='/'
        className='absolute top-8 left-8 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors'>
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to home
      </Link>

      <div className='max-w-md w-full bg-white p-8 rounded-lg shadow-sm'>
        <h2 className='text-3xl font-bold mb-2'>Welcome back</h2>
        <p className='text-neutral-600 mb-6'>Enter your credentials to continue</p>

        {error && <div className='mb-4 p-3 bg-error-50 text-error-700 rounded-lg border border-error-200'>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <Input
              type='email'
              label='Email'
              placeholder='your@email.com'
              {...register('email')}
              error={errors.email?.message}
              leftElement={<Mail className='h-4 w-4' />}
              autoComplete='email'
            />

            <Input
              type='password'
              label='Password'
              placeholder='••••••••'
              {...register('password')}
              error={errors.password?.message}
              leftElement={<Lock className='h-4 w-4' />}
              autoComplete='current-password'
            />

            <div>
              <Button type='submit' variant='primary' className='w-full' isLoading={isLoading}>
                Log in
              </Button>
            </div>
          </div>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-neutral-600'>
            Don't have an account?{' '}
            <Link to='/register' className='text-primary-600 hover:underline'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
