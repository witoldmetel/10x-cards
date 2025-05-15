import { useQuery } from '@tanstack/react-query';
import { getCollections, getCollection } from './api';
import type { CollectionResponse, CollectionsQueryParams, PaginatedCollectionsResponse } from './types';

export function useCollections(params?: CollectionsQueryParams) {
  return useQuery<PaginatedCollectionsResponse>({
    queryKey: ['collections', { archived: params?.archived, searchQuery: params?.searchQuery }],
    queryFn: () => getCollections(params),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useCollection(id: string) {
  return useQuery<CollectionResponse>({
    queryKey: ['collections', id],
    queryFn: () => getCollection(id),
    enabled: !!id,
  });
}
