import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, updateUser, deleteUser, updatePassword } from './api';
import type {
  LoginCredentials,
  RegisterCredentials,
  UpdateUserRequest,
  User,
  UpdatePasswordRequest,
  AuthResponse,
} from './types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: data => {
      onSuccess?.(data);
    },
    onError: error => {
      console.error('Failed to login', error);
      toast.error('Failed to login. Please try again.');
      onError?.(error);
    },
  });
};

export const useRegister = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
    onSuccess: data => {
      onSuccess?.(data);
    },
    onError: error => {
      console.error('Failed to create account', error);
      toast.error('Failed to create account. Please try again.');
      onError?.(error);
    },
  });
};

export const useUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();
  const { updateUserData } = useAuth();

  return useMutation({
    mutationFn: (userData: UpdateUserRequest) => updateUser(userId, userData),
    onSuccess: (updatedUser: User) => {
      updateUserData(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success('Profile updated successfully!');
    },
    onError: error => {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile. Please try again.');
    },
  });
};

export const useDeleteUser = (userId: string) => {
  return useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      toast.success('Account deleted successfully');
    },
    onError: error => {
      console.error('Failed to delete account', error);
      toast.error('Failed to delete account. Please try again.');
    },
  });
};

export const useUpdatePassword = (userId: string, { onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const { onLogin } = useAuth();

  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => updatePassword(userId, data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onLogin(data);
      toast.success('Password updated successfully');
      onSuccess?.();
    },
    onError: error => {
      console.error('Failed to update password', error);
      toast.error('Failed to update password. Please try again.');
    },
  });
};
