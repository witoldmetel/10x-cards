import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      const session = {
        user: {
          id: data.id,
          email: data.email,
          name: data.name,
        },
        token: data.token,
      };

      if (!session.user.id || !session.user.email || !session.token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('flashcards_auth', JSON.stringify(session));

      onLogin(session.token, session.user.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
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
        <h2 className='text-3xl font-bold mb-2'>Create your account</h2>
        <p className='text-neutral-600 mb-6'>Enter your details to get started</p>

        {error && <div className='mb-4 p-3 bg-error-50 text-error-700 rounded-lg border border-error-200'>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <Input
              type='text'
              label='Full Name'
              placeholder='Your name'
              {...register('name')}
              error={errors.name?.message}
              leftElement={<User className='h-4 w-4' />}
              autoComplete='name'
            />

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
              autoComplete='new-password'
            />

            <Input
              type='password'
              label='Confirm Password'
              placeholder='••••••••'
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              leftElement={<Lock className='h-4 w-4' />}
              autoComplete='new-password'
            />

            <div>
              <Button type='submit' variant='primary' className='w-full' isLoading={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </div>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-neutral-600'>
            Already have an account?{' '}
            <Link to='/login' className='text-primary-600 hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
