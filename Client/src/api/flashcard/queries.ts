import { useQuery } from '@tanstack/react-query';
import { getFlashcard, getFlashcards } from './api';
import type { Flashcard } from './types';

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export function useFlashcards(collectionId: string) {
  return useQuery<PaginatedResponse<Flashcard>>({
    queryKey: ['flashcards', collectionId],
    queryFn: () => getFlashcards(collectionId),
    enabled: !!collectionId,
  });
}

export function useFlashcard(id: string) {
  return useQuery({
    queryKey: ['flashcard', id],
    queryFn: () => getFlashcard(id),
    enabled: !!id,
  });
}
