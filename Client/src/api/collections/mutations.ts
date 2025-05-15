import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCollection, updateCollection, deleteCollection, archiveCollection, unarchiveCollection } from './api';
import type { CollectionResponse, CreateCollection, PaginatedCollectionsResponse, UpdateCollection } from './types';

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collection: CreateCollection) => createCollection(collection),
    onSuccess: (newCollection: CollectionResponse) => {
      queryClient.setQueryData<PaginatedCollectionsResponse>(['collections'], oldData => {
        if (!oldData) return { collections: [newCollection], totalCount: 1, limit: 10, offset: 0 };
        return {
          ...oldData,
          collections: [newCollection, ...oldData.collections],
          totalCount: oldData.totalCount + 1,
        };
      });

      queryClient.invalidateQueries({ queryKey: ['collections', newCollection.id] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, collection }: { id: string; collection: UpdateCollection }) => updateCollection(id, collection),
    onSuccess: (updatedCollection: CollectionResponse) => {
      queryClient.invalidateQueries({ queryKey: ['collections', updatedCollection.id] });
      queryClient.setQueryData(['collections', updatedCollection.id], updatedCollection);

      queryClient.setQueryData<PaginatedCollectionsResponse>(['collections'], oldData => {
        if (!oldData) return { collections: [updatedCollection], totalCount: 1, limit: 10, offset: 0 };
        return {
          ...oldData,
          collections: oldData.collections.map((collection: CollectionResponse) =>
            collection.id === updatedCollection.id ? updatedCollection : collection,
          ),
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
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', deletedId] });
    },
  });
}

export function useArchiveCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useUnarchiveCollection({ onSuccess, onError }: { onSuccess: () => void; onError: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      onSuccess();
    },
    onError: () => {
      onError();
    },
  });
}
