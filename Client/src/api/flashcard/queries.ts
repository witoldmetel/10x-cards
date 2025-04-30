import { useQuery } from '@tanstack/react-query';
import { getFlashcards } from './api';
import type { Flashcard, PaginatedResponse } from './types';

export function useFlashcards(collectionId: string) {
  return useQuery<PaginatedResponse<Flashcard>>({
    queryKey: ['flashcards', collectionId],
    queryFn: () => getFlashcards(collectionId),
    enabled: !!collectionId,
  });
}
