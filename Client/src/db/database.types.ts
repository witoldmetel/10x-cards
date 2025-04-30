/**
 * DTO and Command Model definitions for the API.
 * These types are based on the API plan and the underlying database entity models.
 * They are intended for use on the client side to ensure type safety in API interactions.
 */

/* ---------------------- Domain Entities ---------------------- */
/* Although these types represent the database entities,
   they also serve as the base for creating our DTO and Command Models. */

export type User = {
  id: string; // GUID
  name: string;
  email: string;
  password: string; // typically hashed; not exposed in responses
  apiModelKey?: string;
  createdAt: string; // ISO date string
};

export type Collection = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string | null;
  totalCards: number;
  dueCards: number;
  color?: string;
};

export enum FlashcardCreationSource {
  Manual = 'Manual',
  AI = 'AI',
}

export enum ReviewStatus {
  New = 'New',
  ToCorrect = 'ToCorrect',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export type Flashcard = {
  id: string;
  userId: string;
  collectionId: string;
  lastReviewed?: string;
  nextReview?: string;
  front: string;
  back: string;
  reviewStatus: ReviewStatus;
  archivedAt?: string | null;
  creationSource: FlashcardCreationSource;
  tags: string[];
  category: string[];
  sm2Repetitions: number;
  sm2Interval: number;
  sm2Efactor: number;
  sm2DueDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type StudySession = {
  id: string;
  collectionId: string;
  startedAt: string;
  completedAt?: string;
  cardsStudied: number;
  correctAnswers: number;
};

/* ---------------------- User DTOs and Command Models ---------------------- */

// Registration
export type UserRegistration = {
  name: string;
  email: string;
  password: string;
};

export type UserRegistrationResponse = {
  id: string; // GUID
  email: string;
  createdAt: string;
};

// Login
export type UserLogin = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  token: string;
  expiresIn: number;
};

// Password Reset
export type PasswordReset = {
  email: string;
  newPassword: string;
};

export type PasswordResetResponse = {
  message: string;
};

// Delete User
export type DeleteUserResponse = {
  message: string;
};

/* ---------------------- Flashcard DTOs and Command Models ---------------------- */

// Flashcards list response including pagination
export type FlashcardsListResponse = {
  flashcards: Flashcard[];
  page: number;
  limit: number;
  total: number;
};

// Create Flashcard Command Model / DTO
export type CreateFlashcard = {
  front: string;
  back: string;
  tags: string[];
  category: string[];
  reviewStatus: ReviewStatus;
  creationSource: FlashcardCreationSource;
  collectionId: string;
};

// Response after creating a flashcard, mirroring key flashcard fields.
export type CreateFlashcardResponse = Pick<
  Flashcard,
  'id' | 'front' | 'back' | 'reviewStatus' | 'tags' | 'category' | 'createdAt'
>;

// Update Flashcard Command Model / DTO (partial update)
export type UpdateFlashcard = Partial<CreateFlashcard> & {
  id: string;
};

// Response after updating a flashcard.
export type UpdateFlashcardResponse = Pick<
  Flashcard,
  'id' | 'front' | 'back' | 'reviewStatus' | 'tags' | 'category' | 'updatedAt'
>;

// Response after archiving a flashcard.
export type ArchiveFlashcardResponse = {
  id: string;
  archivedAt: string;
};

/* ---------------------- AI Flashcard Generation DTOs ---------------------- */

// Command Model for generating flashcards using AI.
export type AIGenerateRequest = {
  sourceText: string;
  numberOfCards?: number;
  collectionId?: string;
  collectionName?: string;
  apiModelKey?: string;
};

// Response when an AI flashcard generation task is initiated.
export type AIGenerateResponse = {
  flashcards: Omit<Flashcard, 'id' | 'collectionId' | 'createdAt' | 'repetitions' | 'easeFactor' | 'interval'>[];
  collectionId: string;
};
