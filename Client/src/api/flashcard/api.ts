import { instance } from '@/lib/axios';
import { FLASHCARD_API_ROUTES } from './constants';
import type { CreateFlashcardDTO, Flashcard, UpdateFlashcardDTO } from './types';

import type { GenerateFlashcardsAIRequest, GenerateFlashcardsAIResponse } from './types';

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export async function getFlashcards(collectionId: string): Promise<PaginatedResponse<Flashcard>> {
  const { data } = await instance.get<PaginatedResponse<Flashcard>>(`/collections/${collectionId}/flashcards`);
  return data;
}

export async function getFlashcard(id: string): Promise<Flashcard> {
  const { data } = await instance.get<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}`);
  return data;
}

export async function createFlashcard(flashcard: CreateFlashcardDTO): Promise<Flashcard> {
  // Expecting flashcard to have a collectionId property
  if (!('collectionId' in flashcard)) {
    throw new Error('createFlashcard: collectionId is required in flashcard DTO');
  }
  const { collectionId, ...payload } = flashcard as any;
  const { data } = await instance.post<Flashcard>(`/collections/${collectionId}/flashcards`, payload);
  return data;
}

export async function updateFlashcard(flashcard: UpdateFlashcardDTO): Promise<Flashcard> {
  const { data } = await instance.put<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${flashcard.id}`, flashcard);
  return data;
}

export async function deleteFlashcard(id: string): Promise<void> {
  await instance.delete(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}`);
}

export async function generateFlashcardsAI(
  collectionId: string,
  payload: GenerateFlashcardsAIRequest,
): Promise<GenerateFlashcardsAIResponse> {
  const { data } = await instance.post<GenerateFlashcardsAIResponse>(
    `/collections/${collectionId}/flashcards/generate`,
    payload,
  );
  return data;
}
