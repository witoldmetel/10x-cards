export interface Flashcard {
  id: string;
  front: string;
  back: string;
  reviewStatus: ReviewStatus;
  reviewedAt?: string | null;
  creationSource: FlashcardCreationSource;
  sm2Repetitions: number;
  sm2Interval: number;
  sm2Efactor: number;
  sm2DueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  archivedAt?: string | null;
  userId: string;
  collectionId: string;
}

export enum FlashcardCreationSource {
  Manual = 'Manual',
  AI = 'AI',
}

export enum ReviewStatus {
  New = 'New',
  ToCorrect = 'ToCorrect',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface CreateFlashcardDTO {
  front: string;
  back: string;
  creationSource: FlashcardCreationSource;
  reviewStatus?: ReviewStatus;
}

export interface UpdateFlashcardDTO {
  front?: string;
  back?: string;
  reviewStatus?: ReviewStatus;
  archivedAt?: string | null;
}

export interface GenerateFlashcardsRequest {
  sourceText: string;
  count: number;
  model?: string;
}

export type GenerateFlashcardsResponse = Array<{
  id: string;
  userId: string;
  collectionId: string;
  front: string;
  back: string;
  reviewStatus: ReviewStatus;
  reviewedAt?: string | null;
  creationSource: FlashcardCreationSource;
  sm2Repetitions: number;
  sm2Interval: number;
  sm2Efactor: number;
  sm2DueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  archivedAt?: string | null;
}>;

export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  offset: number;
  totalCount: number;
}

export interface BatchUpdateRequest {
  flashcardIds: string[];
  update: UpdateFlashcardDTO;
}

export interface BatchUpdateResponse {
  updatedIds: string[];
  message: string;
}

export interface ArchivedStatisticsDto {
  totalArchived: number;
  archivedByCategory: Record<string, number>;
}

export interface FlashcardsQueryParams {
  offset?: number;
  limit?: number;
  reviewStatus?: ReviewStatus;
  searchQuery?: string;
  archived?: boolean;
}

export interface StudySessionResult {
  flashcardId: string;
  grade: number;
  studiedAt: string;
}

export interface StudySessionRequest {
  collectionId: string;
  results: StudySessionResult[];
}
