import { instance } from '@/lib/axios';
import { COLLECTIONS_API_BASE, COLLECTION_API_ROUTES } from './constants';
import type {
  CollectionResponse,
  CreateCollection,
  UpdateCollection,
  PaginatedCollectionsResponse,
  CollectionsQueryParams,
  CollectionStatistics,
} from './types';

export async function getCollections(params?: CollectionsQueryParams): Promise<PaginatedCollectionsResponse> {
  const cleanParams = params
    ? {
        ...params,
        searchQuery: params.searchQuery ? params.searchQuery : undefined,
      }
    : undefined;

  const { data } = await instance.get<PaginatedCollectionsResponse>(COLLECTIONS_API_BASE, { params: cleanParams });

  return data;
}

export async function getCollection(id: string): Promise<CollectionResponse> {
  const { data } = await instance.get<CollectionResponse>(`${COLLECTIONS_API_BASE}/${id}`);

  return data;
}

export async function createCollection(collection: CreateCollection): Promise<CollectionResponse> {
  const { data } = await instance.post<CollectionResponse>(COLLECTIONS_API_BASE, collection);

  return data;
}

export async function updateCollection(id: string, collection: UpdateCollection): Promise<CollectionResponse> {
  const { data } = await instance.put<CollectionResponse>(`${COLLECTIONS_API_BASE}/${id}`, collection);

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

export async function getCollectionStatistics(collectionId: string): Promise<CollectionStatistics> {
  const { data } = await instance.get<CollectionStatistics>(`${COLLECTION_API_ROUTES.STATISTICS}/${collectionId}`);

  return data;
}
