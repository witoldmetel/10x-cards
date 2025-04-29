import { instance } from '@/lib/axios';
import { FLASHCARD_API_ROUTES } from './constants';
import type { CreateFlashcardDTO, Flashcard, UpdateFlashcardDTO } from './types';
import type { Collection } from '@/db/database.types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function getFlashcards(): Promise<PaginatedResponse<Collection>> {
  const { data } = await instance.get<PaginatedResponse<Collection>>(FLASHCARD_API_ROUTES.GET_FLASHCARDS);
  return data;
}

export async function getFlashcard(id: string): Promise<Flashcard> {
  const { data } = await instance.get<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}`);
  return data;
}

export async function createFlashcard(flashcard: CreateFlashcardDTO): Promise<Flashcard> {
  const { data } = await instance.post<Flashcard>(FLASHCARD_API_ROUTES.GET_FLASHCARDS, flashcard);
  return data;
}

export async function updateFlashcard(flashcard: UpdateFlashcardDTO): Promise<Flashcard> {
  const { data } = await instance.put<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${flashcard.id}`, flashcard);
  return data;
}

export async function deleteFlashcard(id: string): Promise<void> {
  await instance.delete(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}`);
}
