import { Flashcard } from '../flashcard/types';

export interface CollectionResponse {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  tags: string[];
  categories: string[];
  totalCards: number;
  dueCards: number;
  lastStudied: string | null;
  masteryLevel: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  updatedAt?: string;
  archivedAt: string | null;
  flashcards: Flashcard[];
  archivedFlashcards: Flashcard[];
}

export interface CollectionStatistics {
  masteryLevel: number;
  lastStudied: string | null;
  totalCards: number;
  masteredCards: number;
  currentStreak: number;
  bestStreak: number;
  dueCards: number;
  archivedCards: number;
}

export interface CollectionsQueryParams {
  offset?: number;
  limit?: number;
  searchQuery?: string;
  archived?: boolean;
}

export interface PaginatedCollectionsResponse {
  collections: CollectionResponse[];
  limit: number;
  offset: number;
  totalCount: number;
}

export type CreateCollectionDTO = {
  name: string;
  description?: string;
  color: string;
  tags?: string[];
  categories?: string[];
};

export type UpdateCollectionDTO = {
  name?: string;
  description?: string;
  color?: string;
  tags?: string[];
  categories?: string[];
  archivedAt?: string | null;
};
