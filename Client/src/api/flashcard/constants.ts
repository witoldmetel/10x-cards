export const FLASHCARD_API_ROUTES = {
  BASE: '/flashcards',
  BY_ID: (id: string) => `/flashcards/${id}`,
} as const;
