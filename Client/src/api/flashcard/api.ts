import { instance } from '@/lib/axios';
import type {
  Flashcard,
  CreateFlashcardDTO,
  UpdateFlashcardDTO,
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
  ArchivedStatisticsDto,
} from './types';
import { FLASHCARD_API_ROUTES } from './constants';

export async function createFlashcard(collectionId: string, flashcard: CreateFlashcardDTO): Promise<Flashcard> {
  const { data } = await instance.post<Flashcard>(`collections/${collectionId}/flashcards`, flashcard);
  return data;
}

export async function updateFlashcard(id: string, flashcard: UpdateFlashcardDTO): Promise<Flashcard> {
  const { data } = await instance.put<Flashcard>(`${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/${id}`, flashcard);
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
  onProgress?: (progress: number) => void,
): Promise<GenerateFlashcardsResponse> {
  const { data } = await instance.post<GenerateFlashcardsResponse>(
    `collections/${collectionId}/flashcards/generate`,
    request,
    {
      onUploadProgress: progressEvent => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    },
  );
  return data;
}

export async function getArchivedStatistics(): Promise<ArchivedStatisticsDto> {
  const { data } = await instance.get<ArchivedStatisticsDto>(
    `${FLASHCARD_API_ROUTES.GET_FLASHCARDS}/archived/statistics`,
  );
  return data;
}