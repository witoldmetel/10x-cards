import { useState } from 'react';
import { Link } from 'react-router';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRegister } from '@/api/user/mutations';
import { AxiosError } from 'axios';
import { AuthResponse } from '@/api/user/types';

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
  const [error, setError] = useState<string | null>(null);
  const { onLogin } = useAuth();
  const registerMutation = useRegister({
    onSuccess: (data: AuthResponse) => {
      onLogin(data);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{ detail: string }>;

        if (axiosError.response?.data && 'detail' in axiosError.response.data) {
          setError(axiosError.response.data.detail);
        } else {
          setError(axiosError.message || 'Failed to create account');
        }
      } else {
        setError('Failed to create account');
      }
    },
  });

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData: RegisterFormData) => {
    await registerMutation.mutateAsync({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className='w-full'>
      <h1 className='text-2xl font-bold mb-6'>Create an Account</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
          data-testid='register-form'
          // Debug: Add inline style to ensure visibility
          style={{ display: 'block', visibility: 'visible' }}>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder='John Doe' autoComplete='name' data-testid='name-input' {...field} />
                </FormControl>
                <FormMessage data-testid='name-error' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='your@email.com'
                    type='email'
                    autoComplete='email'
                    data-testid='email-input'
                    {...field}
                  />
                </FormControl>
                <FormMessage data-testid='email-error' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder='••••••••'
                    type='password'
                    autoComplete='new-password'
                    data-testid='password-input'
                    {...field}
                  />
                </FormControl>
                <FormMessage data-testid='password-error' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder='••••••••'
                    type='password'
                    autoComplete='new-password'
                    data-testid='confirm-password-input'
                    {...field}
                  />
                </FormControl>
                <FormMessage data-testid='confirmPassword-error' />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full' disabled={registerMutation.isPending} data-testid='register-submit'>
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </Button>
          {error && (
            <div className='text-red-500 text-sm' data-testid='register-error'>
              {error}
            </div>
          )}
        </form>
      </Form>
      <div className='mt-6 text-center text-sm'>
        Already have an account?{' '}
        <Link to='/login' className='text-primary hover:underline' data-testid='login-link'>
          Sign in
        </Link>
      </div>
    </div>
  );
}
