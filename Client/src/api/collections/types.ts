export interface CollectionResponseDto {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string;
  totalCards: number;
  dueCards: number;
  color: string;
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  color: string;
  userId: string;
}

export interface UpdateCollectionDto {
  name: string;
  description?: string;
  color: string;
  userId: string;
}

export interface CollectionsQueryParams {
  offset?: number;
  limit?: number;
  searchPhrase?: string;
  archived?: boolean;
}

export interface PaginatedCollectionsResponse {
  collections: CollectionResponseDto[];
  limit: number;
  offset: number;
  totalCount: number;
}

