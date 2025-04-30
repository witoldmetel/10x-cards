import { instance } from '@/lib/axios';
import { COLLECTIONS_API_BASE } from './constants';
import type {
  CollectionResponseDto,
  CreateCollectionDto,
  UpdateCollectionDto,
  PaginatedCollectionsResponse,
  CollectionsQueryParams,
} from './types';

export async function getCollections(params?: CollectionsQueryParams): Promise<PaginatedCollectionsResponse> {
  const { data } = await instance.get<PaginatedCollectionsResponse>(COLLECTIONS_API_BASE, { params });

  return data;
}

export async function getCollection(id: string): Promise<CollectionResponseDto> {
  const { data } = await instance.get<CollectionResponseDto>(`${COLLECTIONS_API_BASE}/${id}`);

  return data;
}

export async function createCollection(collection: CreateCollectionDto): Promise<CollectionResponseDto> {
  const { data } = await instance.post<CollectionResponseDto>(COLLECTIONS_API_BASE, collection);

  return data;
}

export async function updateCollection(id: string, collection: UpdateCollectionDto): Promise<CollectionResponseDto> {
  const { data } = await instance.put<CollectionResponseDto>(`${COLLECTIONS_API_BASE}/${id}`, collection);

  return data;
}

export async function archiveCollection(id: string): Promise<void> {
  await instance.put(`${COLLECTIONS_API_BASE}/${id}/archive`);
}

export async function unarchiveCollection(id: string): Promise<void> {
  await instance.put(`${COLLECTIONS_API_BASE}/${id}/unarchive`);
}

export async function deleteCollection(id: string): Promise<void> {
  await instance.delete(`${COLLECTIONS_API_BASE}/${id}`);
}
