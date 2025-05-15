import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, updateUser, deleteUser } from './api';
import type { LoginCredentials, RegisterCredentials, UpdateUserRequest, User } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
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
      console.log('Profile updated successfully!');
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
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
    onError: (error) => {
      console.error('Failed to delete account', error);
      toast.error('Failed to delete account. Please try again.');
    },
  });
};
