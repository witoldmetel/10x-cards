import { instance } from '@/lib/axios';
import { FLASHCARD_API_ROUTES } from './constants';
import type { CreateFlashcardDTO, Flashcard, UpdateFlashcardDTO } from './types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const getFlashcards = async (): Promise<PaginatedResponse<Flashcard>> => {
  const { data } = await instance.get<PaginatedResponse<Flashcard>>(FLASHCARD_API_ROUTES.BASE);

  return data;
};

export const getFlashcard = async (id: string): Promise<Flashcard> => {
  const { data } = await instance.get<Flashcard>(FLASHCARD_API_ROUTES.BY_ID(id));

  return data;
};

export const createFlashcard = async (flashcard: CreateFlashcardDTO): Promise<Flashcard> => {
  const { data } = await instance.post<Flashcard>(FLASHCARD_API_ROUTES.BASE, flashcard);

  return data;
};

export const updateFlashcard = async ({ id, ...flashcard }: UpdateFlashcardDTO): Promise<Flashcard> => {
  const { data } = await instance.patch<Flashcard>(FLASHCARD_API_ROUTES.BY_ID(id), flashcard);

  return data;
};

export const deleteFlashcard = async (id: string): Promise<void> => {
  await instance.delete(FLASHCARD_API_ROUTES.BY_ID(id));
};
