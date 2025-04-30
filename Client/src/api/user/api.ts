import { instance } from '@/lib/axios';
import { USER_API_ROUTES } from './constants';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from './types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await instance.post(USER_API_ROUTES.LOGIN, credentials);

  return data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { data } = await instance.post(USER_API_ROUTES.REGISTER, credentials);

  return data;
};

export const getUser = async (id: string): Promise<User> => {
  const { data } = await instance.get(USER_API_ROUTES.PROFILE(id));

  return data;
};
