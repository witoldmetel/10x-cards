import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getCollections, getCollection, getCollectionStatistics } from './api';
import type {
  CollectionResponse,
  CollectionsQueryParams,
  PaginatedCollectionsResponse,
  CollectionStatistics,
} from './types';

export function useCollections(params?: CollectionsQueryParams) {
  return useInfiniteQuery<PaginatedCollectionsResponse>({
    queryKey: ['collections', { archived: params?.archived, searchQuery: params?.searchQuery }],
    queryFn: ({ pageParam }) => getCollections({ ...params, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * (params?.limit || 20);
      return nextOffset < lastPage.totalCount ? nextOffset : undefined;
    },
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
