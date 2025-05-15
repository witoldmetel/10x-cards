import { Flashcard } from '../flashcard/types';

export interface CollectionResponse {
  archivedAt: string | null;
  archivedFlashcards: Flashcard[];
  categories: string[];
  color: string;
  createdAt: string;
  description: string | null;
  dueCards: number;
  flashcards: Flashcard[];
  id: string;
  lastStudied: string | null;
  masteryLevel: number;
  name: string;
  tags: string[];
  totalCards: number;
  updatedAt?: string;
}

export interface CreateCollection {
  name: string;
  description?: string;
  color: string;
  tags?: string[];
  categories?: string[];
}

export interface UpdateCollection {
  name: string;
  description?: string;
  color: string;
  tags?: string[];
  categories?: string[];
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
