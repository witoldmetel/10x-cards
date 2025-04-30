

import { useQuery } from '@tanstack/react-query';
import { getCollections, getCollection } from './api';


export const useCollections = () =>
  useQuery({
    queryKey: ['collections'],
    queryFn: getCollections,
  });

export const useCollection = (id: string) =>
  useQuery({
    queryKey: ['collections', id],
    queryFn: () => getCollection(id),
    enabled: !!id,
  });
