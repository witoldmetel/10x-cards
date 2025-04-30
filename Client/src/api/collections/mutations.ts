import { useMutation } from '@tanstack/react-query';
import { createCollection, updateCollection, deleteCollection } from './api';
import type { CreateCollectionDto, UpdateCollectionDto } from './types';

export const useCreateCollection = () =>
  useMutation({
    mutationFn: (payload: CreateCollectionDto) => createCollection(payload),
  });

export const useUpdateCollection = () =>
  useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCollectionDto }) => updateCollection(id, payload),
  });

export const useDeleteCollection = () =>
  useMutation({
    mutationFn: (id: string) => deleteCollection(id),
  });
