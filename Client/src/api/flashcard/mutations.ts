import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFlashcard, deleteFlashcard, updateFlashcard, generateFlashcardsAI } from './api';
import type { CreateFlashcardDTO, Flashcard, UpdateFlashcardDTO, GenerateFlashcardsAIRequest, GenerateFlashcardsAIResponse } from './types';

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flashcard: CreateFlashcardDTO) => createFlashcard(flashcard),
    onSuccess: (newFlashcard: Flashcard) => {
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
    mutationFn: (flashcard: UpdateFlashcardDTO) => updateFlashcard(flashcard),
    onSuccess: (updatedFlashcard: Flashcard) => {
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
  GenerateFlashcardsAIResponse,
  unknown,
  { collectionId: string; payload: GenerateFlashcardsAIRequest }
> =>
  useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: GenerateFlashcardsAIRequest }) =>
      generateFlashcardsAI(collectionId, payload)
  });
