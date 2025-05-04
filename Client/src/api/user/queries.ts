import { useQuery } from '@tanstack/react-query';
import {  getUserById } from './api';
import type { User } from './types';


export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
  });
};
