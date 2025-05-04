export interface Flashcard {
  id: string;
  front: string;
  back: string;
  reviewStatus: ReviewStatus;
  reviewedAt?: string | null;
  creationSource: FlashcardCreationSource;
  tags: string[];
  category: string[];
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
  tags?: string[];
  category?: string[];
  reviewStatus?: ReviewStatus;
  archivedAt?: string | null;
}

export interface GenerateFlashcardsRequest {
  sourceText: string;
  numberOfCards: number;
  modelName?: string;
  apiModelKey?: string;
}

export interface GenerateFlashcardsResponse {
  flashcards: CreateFlashcardDTO[];
  collectionId: string;
}

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
  searchPhrase?: string;
  tag?: string;
  category?: string;
  archived?: boolean;
}
