import { useQuery } from '@tanstack/react-query';
import { getFlashcard, getFlashcards } from './api';
import type { Flashcard } from './types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const useFlashcards = () => {
  return useQuery<PaginatedResponse<Flashcard>>({
    queryKey: ['flashcards'],
    queryFn: getFlashcards,
  });
};

export const useFlashcard = (id: string) => {
  return useQuery<Flashcard>({
    queryKey: ['flashcard', id],
    queryFn: () => getFlashcard(id),
  });
};
