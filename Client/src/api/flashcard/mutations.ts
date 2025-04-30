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
      queryClient.invalidateQueries({ queryKey: ['collections', newFlashcard.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', newFlashcard.collectionId] });
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flashcard }: { id: string; flashcard: UpdateFlashcardDTO }) =>
      updateFlashcard(id, flashcard),
    onSuccess: (updatedFlashcard: Flashcard) => {
      queryClient.invalidateQueries({ queryKey: ['collections', updatedFlashcard.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', updatedFlashcard.collectionId] });
    },
  });
};

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFlashcard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
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
