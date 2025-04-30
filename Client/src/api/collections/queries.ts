import { useQuery } from '@tanstack/react-query';
import { getCollections, getCollection } from './api';
import type { CollectionResponseDto, CollectionsQueryParams, PaginatedCollectionsResponse } from './types';

export function useCollections(params?: CollectionsQueryParams) {
  return useQuery<PaginatedCollectionsResponse>({
    queryKey: ['collections', params],
    queryFn: () => getCollections(params),
  });
}

export function useCollection(id: string) {
  return useQuery<CollectionResponseDto>({
    queryKey: ['collections', id],
    queryFn: () => getCollection(id),
    enabled: !!id,
  });
}

export function useArchivedCollections() {
  return useQuery<PaginatedCollectionsResponse>({
    queryKey: ['collections', { archived: true }],
    queryFn: () => getCollections({ archived: true }),
  });
}
