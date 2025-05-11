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
  searchPhrase?: string;
  archived?: boolean;
}

export interface PaginatedCollectionsResponse {
  collections: CollectionResponse[];
  limit: number;
  offset: number;
  totalCount: number;
}
