import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFlashcard, deleteFlashcard, generateFlashcards, updateFlashcard } from './api';
import type {
  CreateFlashcardDTO,
  Flashcard,
  UpdateFlashcardDTO,
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
} from './types';

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, flashcard }: { collectionId: string; flashcard: CreateFlashcardDTO }) =>
      createFlashcard(collectionId, flashcard),
    onSuccess: (newFlashcard: Flashcard) => {
      console.log('newFlashcard', newFlashcard);
      queryClient.invalidateQueries({ queryKey: ['collections', newFlashcard.collectionId] });
      // Update the flashcards list cache
      queryClient.setQueryData<Flashcard[]>(['flashcards'], oldData => {
        if (!oldData) return [newFlashcard];
        return [newFlashcard, ...oldData];
      });
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flashcard }: { id: string; flashcard: UpdateFlashcardDTO }) =>
      updateFlashcard(id, flashcard),
    onSuccess: (updatedFlashcard: Flashcard, variables: { id: string; flashcard: UpdateFlashcardDTO }) => {
      console.log('updatedFlashcard', variables);
      queryClient.invalidateQueries({ queryKey: ['collections', variables.id] });

      // Update both the single flashcard and the list cache
      queryClient.setQueryData(['flashcard', updatedFlashcard.id], updatedFlashcard);
      queryClient.setQueryData<Flashcard[]>(['flashcards'], oldData => {
        if (!oldData) return [updatedFlashcard];
        return oldData.map(card => (card.id === updatedFlashcard.id ? updatedFlashcard : card));
      });
    },
  });
};

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFlashcard(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });

      // Remove the flashcard from the list cache
      queryClient.setQueryData<Flashcard[]>(['flashcards'], oldData => {
        if (!oldData) return [];
        return oldData.filter(card => card.id !== deletedId);
      });
      // Remove the single flashcard cache
      queryClient.removeQueries({ queryKey: ['flashcard', deletedId] });
    },
  });
};

export const useGenerateFlashcardsAI = (): UseMutationResult<
  GenerateFlashcardsResponse,
  unknown,
  { collectionId: string; payload: GenerateFlashcardsRequest }
> =>
  useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: GenerateFlashcardsRequest }) =>
      generateFlashcards(collectionId, payload),
  });
