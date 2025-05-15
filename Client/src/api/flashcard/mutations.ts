import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFlashcard, deleteFlashcard, generateFlashcards, updateFlashcard, archiveFlashcard } from './api';
import type { CreateFlashcardDTO, Flashcard, UpdateFlashcardDTO, GenerateFlashcardsRequest } from './types';

type ErrorResponse = {
  message: string;
  status: number;
};

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
    mutationFn: ({ id, flashcard }: { id: string; flashcard: UpdateFlashcardDTO }) => updateFlashcard(id, flashcard),
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

export const useGenerateFlashcardsAI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      payload,
      onProgress,
    }: {
      collectionId: string;
      payload: GenerateFlashcardsRequest;
      onProgress?: (progress: number) => void;
    }) => generateFlashcards(collectionId, payload, onProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', variables.collectionId] });
    },
    onError: (error: unknown) => {
      const errorResponse = error as ErrorResponse;
      console.error('Error generating flashcards:', errorResponse.message);
      throw error;
    },
  });
};

export const useArchiveFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveFlashcard(id),
    onSuccess: (archivedFlashcard: Flashcard) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', archivedFlashcard.collectionId] });
    },
  });
};
