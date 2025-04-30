import { useQuery } from '@tanstack/react-query';
import { getCollections, getCollection } from './api';
import type { CollectionResponseDto, CollectionsQueryParams, PaginatedCollectionsResponse } from './types';

// Note: To get flashcards for a collection, use the useFlashcards hook from '@/api/flashcard/queries'
export function useCollections(params?: CollectionsQueryParams) {
  return useQuery<PaginatedCollectionsResponse>({
    queryKey: ['collections', params],
    queryFn: () => getCollections(params),
  });
}

export function useArchivedCollections(params?: CollectionsQueryParams) {
  return useQuery<PaginatedCollectionsResponse>({
    queryKey: ['collections', { ...params, archived: true }],
    queryFn: () => getCollections({ ...params, archived: true }),
  });
}

// Note: This hook returns collection metadata only. To get flashcards, use useFlashcards(id) from '@/api/flashcard/queries'
export function useCollection(id: string) {
  return useQuery<CollectionResponseDto>({
    queryKey: ['collections', id],
    queryFn: () => getCollection(id),
    enabled: !!id,
  });
}
