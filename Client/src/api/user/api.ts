import { instance } from '@/lib/axios';
import { USER_API_ROUTES } from './constants';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User, UpdateUserRequest, UpdatePasswordRequest } from './types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await instance.post(USER_API_ROUTES.LOGIN, credentials);

  return data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { data } = await instance.post(USER_API_ROUTES.REGISTER, credentials);

  return data;
};

export const resetPassword = async (email: string, newPassword: string): Promise<{ message: string }> => {
  const { data } = await instance.post(USER_API_ROUTES.PASSWORD_RESET, { email, newPassword });

  return data;
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await instance.get(USER_API_ROUTES.PROFILE_BY_ID(id));

  return data;
};

export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<User> => {
  const { data } = await instance.put(USER_API_ROUTES.PROFILE_BY_ID(id), userData);

  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await instance.delete(USER_API_ROUTES.PROFILE_BY_ID(id));
};

export const updatePassword = async (id: string, data: UpdatePasswordRequest): Promise<void> => {
  await instance.put(USER_API_ROUTES.PASSWORD_UPDATE(id), data);
};
