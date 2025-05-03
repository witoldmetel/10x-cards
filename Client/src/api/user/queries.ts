import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getUserById } from './api';
import type { User } from './types';

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });
};

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
  });
};
