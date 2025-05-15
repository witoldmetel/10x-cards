import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLogin } from '@/api/user/mutations';
import { AxiosError } from 'axios';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const { onLogin } = useAuth();
  const loginMutation = useLogin({
    onSuccess: (data) => {
      onLogin(data);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{detail: string}>;

        if (axiosError.response?.data && 'detail' in axiosError.response.data) {
          setError(axiosError.response.data.detail);
        } else {
          setError(axiosError.message || 'Failed to sign in');
        }
      } else {
        setError('Failed to sign in');
      }
    }
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
    await loginMutation.mutateAsync(formData);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Welcome Back</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    autoComplete="email"
                    data-testid="email-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  {/* <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline pointer-events-none opacity-50"
                  >
                    Forgot password?
                  </Link> */}
                </div>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    data-testid="password-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
            data-testid="login-submit"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
          {error && <div className="text-red-500 text-sm" data-testid="login-error">{error}</div>}
        </form>
      </Form>
      <div className="mt-6 text-center text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
          Sign up
        </Link>
      </div>
    </div>
  );
}
