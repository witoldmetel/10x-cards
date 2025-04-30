import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCollection, updateCollection, deleteCollection } from './api';
import type { CollectionResponseDto, CreateCollectionDto, PaginatedCollectionsResponse, UpdateCollectionDto } from './types';



export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collection: CreateCollectionDto) => createCollection(collection),
    onSuccess: (newCollection: CollectionResponseDto) => {
      queryClient.setQueryData<PaginatedCollectionsResponse>(['collections'], (oldData) => {
        if (!oldData) return { collections: [newCollection], totalCount: 1, limit: 10, offset: 0 };
        return {
          ...oldData,
          collections: [newCollection, ...oldData.collections],
          totalCount: oldData.totalCount + 1
        };
      });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, collection }: { id: string; collection: UpdateCollectionDto }) => 
      updateCollection(id, collection),
    onSuccess: (updatedCollection: CollectionResponseDto) => {
      queryClient.invalidateQueries({ queryKey: ['collections', updatedCollection.id] });
      // Update the single collection cache
      queryClient.setQueryData(['collections', updatedCollection.id], updatedCollection);
      
      // Update the collections list cache
      queryClient.setQueryData<PaginatedCollectionsResponse>(['collections'], (oldData) => {
        if (!oldData) return { collections: [updatedCollection], totalCount: 1, limit: 10, offset: 0 };
        return {
          ...oldData,
          collections: oldData.collections.map((collection: CollectionResponseDto) => 
            collection.id === updatedCollection.id ? updatedCollection : collection
          )
        };
      });



    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['collections', deletedId] });
      // Remove from collections list cache
      queryClient.setQueryData<PaginatedCollectionsResponse>(['collections'], (oldData) => {
        if (!oldData) return { collections: [], totalCount: 0, limit: 10, offset: 0 };
        return {
          ...oldData,
          collections: oldData.collections.filter((collection: CollectionResponseDto) => collection.id !== deletedId),
          totalCount: oldData.totalCount - 1
        };
      });
      


    },
  });
}
