import { useQuery } from '@tanstack/react-query';
import { getProfile } from './api';
import type { User } from './types';

export const useProfile = () => {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
};
