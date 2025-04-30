

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
}

export interface UpdateCollectionDto {
  name: string;
  description?: string;
  color: string;
}
