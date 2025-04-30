import { instance } from '@/lib/axios';
import { FLASHCARD_API_ROUTES } from './constants';
import type {
  CreateFlashcardDTO,
  Flashcard,
  UpdateFlashcardDTO,
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
  PaginatedResponse,
  BatchUpdateRequest,
  BatchUpdateResponse,
  ArchivedStatisticsDto,
  FlashcardsQueryParams,
} from './types';

export async function getFlashcards(
  collectionId: string,
  params?: FlashcardsQueryParams,
): Promise<PaginatedResponse<Flashcard>> {
  const { data } = await instance.get<PaginatedResponse<Flashcard>>(`/collections/${collectionId}/flashcards`, {
    params
  });
  return data;
}

export async function getArchivedFlashcards(params?: FlashcardsQueryParams): Promise<PaginatedResponse<Flashcard>> {
  const { data } = await instance.get<PaginatedResponse<Flashcard>>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/archived`, {
    params,
  });
  return data;
}

export async function createFlashcard(collectionId: string, flashcard: CreateFlashcardDTO): Promise<Flashcard> {
  const { data } = await instance.post<Flashcard>(`/collections/${collectionId}/flashcards`, flashcard);
  return data;
}

export async function updateFlashcard(id: string, flashcard: UpdateFlashcardDTO): Promise<Flashcard> {
  const { data } = await instance.put<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}`, flashcard);
  return data;
}

export async function batchUpdateFlashcards(request: BatchUpdateRequest): Promise<BatchUpdateResponse> {
  const { data } = await instance.put<BatchUpdateResponse>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/batch`, request);
  return data;
}

export async function archiveFlashcard(id: string): Promise<Flashcard> {
  const { data } = await instance.put<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}/archive`);
  return data;
}

export async function unarchiveFlashcard(id: string): Promise<Flashcard> {
  const { data } = await instance.put<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}/unarchive`);
  return data;
}

export async function deleteFlashcard(id: string): Promise<void> {
  await instance.delete(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}`);
}

export async function generateFlashcards(
  collectionId: string,
  request: GenerateFlashcardsRequest,
): Promise<GenerateFlashcardsResponse> {
  const { data } = await instance.post<GenerateFlashcardsResponse>(
    `/collections/${collectionId}/flashcards/generate`,
    request,
  );
  return data;
}

export async function getArchivedStatistics(): Promise<ArchivedStatisticsDto> {
  const { data } = await instance.get<ArchivedStatisticsDto>(
    `${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/archived/statistics`,
  );
  return data;
}
