import { instance } from '@/lib/axios';
import { COLLECTIONS_API_BASE } from './constants';
import type { CollectionResponseDto, CreateCollectionDto, UpdateCollectionDto } from './types';

export async function getCollections(): Promise<CollectionResponseDto[]> {
  const { data } = await instance.get<CollectionResponseDto[]>(COLLECTIONS_API_BASE);

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

export async function deleteCollection(id: string): Promise<void> {
  await instance.delete(`${COLLECTIONS_API_BASE}/${id}`);
}
