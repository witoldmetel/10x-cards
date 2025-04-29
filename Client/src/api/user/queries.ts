import { useQuery } from '@tanstack/react-query';
import { getUser } from './api';
import type { User } from './types';

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
  });
};
