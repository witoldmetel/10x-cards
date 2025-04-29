import { useQuery } from '@tanstack/react-query';
import { getFlashcard, getFlashcards } from './api';
import type { Collection } from '@/db/database.types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useFlashcards() {
  return useQuery<PaginatedResponse<Collection>>({
    queryKey: ['flashcards'],
    queryFn: getFlashcards,
  });
}

export function useFlashcard(id: string) {
  return useQuery({
    queryKey: ['flashcard', id],
    queryFn: () => getFlashcard(id),
    enabled: !!id,
  });
}
