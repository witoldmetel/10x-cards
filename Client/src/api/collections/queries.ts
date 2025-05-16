import { useQuery } from '@tanstack/react-query';
import { getCollections, getCollection, getCollectionStatistics } from './api';
import type {
  CollectionResponse,
  CollectionsQueryParams,
  PaginatedCollectionsResponse,
  CollectionStatistics,
} from './types';

export function useCollections(params?: CollectionsQueryParams) {
  return useQuery<PaginatedCollectionsResponse>({
    queryKey: ['collections', { archived: params?.archived, searchQuery: params?.searchQuery }],
    queryFn: () => getCollections(params),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export const useCollection = (id: string) => {
  return useQuery<CollectionResponse>({
    queryKey: ['collections', id],
    queryFn: () => getCollection(id),
    enabled: !!id,
  });
};

export const useCollectionStatistics = (id?: string) => {
  return useQuery<CollectionStatistics>({
    queryKey: ['collections', id || 'global', 'statistics'],
    queryFn: () => getCollectionStatistics(id || 'global'),
    enabled: true,
  });
};
