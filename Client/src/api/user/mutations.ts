import { useMutation } from '@tanstack/react-query';
import { login, register } from './api';
import type { LoginCredentials, RegisterCredentials } from './types';

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
