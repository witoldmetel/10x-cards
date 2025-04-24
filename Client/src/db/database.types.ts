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
  email: string;
  password: string; // typically hashed; not exposed in responses
  api_model_key?: string;
  created_at: string; // ISO date string
};

export enum FlashcardCreationSource {
  Manual = 'Manual',
  AI = 'AI'
}

export enum ReviewStatus {
  New = 'New',
  ToCorrect = 'ToCorrect',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export type Flashcard = {
  id: string; // GUID
  user_id: string; // GUID
  front: string;
  back: string;
  review_status: ReviewStatus;
  is_archived: boolean;
  archived_at?: string | null; // ISO date string
  creation_source: FlashcardCreationSource;
  tags: string[];
  category: string[];
  sm2_repetitions: number;
  sm2_interval: number;
  sm2_efactor: number;
  sm2_due_date?: string | null; // ISO date string
  created_at: string; // ISO date string
  updated_at?: string | null; // ISO date string
};

/* ---------------------- User DTOs and Command Models ---------------------- */

// Registration
export type UserRegistrationDto = {
  email: string;
  password: string;
};

export type UserRegistrationResponseDto = {
  id: string; // GUID
  email: string;
  created_at: string;
};

// Login
export type UserLoginDto = {
  email: string;
  password: string;
};

export type UserLoginResponseDto = {
  token: string;
  expires_in: number;
};

// Password Reset
export type PasswordResetDto = {
  email: string;
  new_password: string;
};

export type PasswordResetResponseDto = {
  message: string;
};

// Delete User
export type DeleteUserResponseDto = {
  message: string;
};

/* ---------------------- Flashcard DTOs and Command Models ---------------------- */

// For listing flashcards (minimal fields)
export type FlashcardListItemDto = Pick<
  Flashcard,
  'id' | 'front' | 'back' | 'review_status' | 'tags' | 'category' | 'created_at'
>;

// Pagination details for list responses
export type PaginationDto = {
  page: number;
  limit: number;
  total: number;
};

// Flashcards list response including pagination
export type FlashcardsListResponseDto = {
  flashcards: FlashcardListItemDto[];
  pagination: PaginationDto;
};

// Detailed Flashcard DTO (used, for example, in the flashcard details endpoint)
// Excludes the `user_id` as it is part of the domain internal logic.
export type FlashcardDetailsDto = Omit<Flashcard, 'user_id'>;

// Create Flashcard Command Model / DTO
export type CreateFlashcardDto = {
  front: string;
  back: string;
  tags: string[];
  category: string[];
  review_status: ReviewStatus;
  creation_source: FlashcardCreationSource;
};

// Response after creating a flashcard, mirroring key flashcard fields.
export type CreateFlashcardResponseDto = Pick<
  Flashcard,
  'id' | 'front' | 'back' | 'review_status' | 'tags' | 'category' | 'created_at'
>;

// Update Flashcard Command Model / DTO (partial update)
export type UpdateFlashcardDto = Partial<CreateFlashcardDto>;

// Response after updating a flashcard.
export type UpdateFlashcardResponseDto = Pick<
  Flashcard,
  'id' | 'front' | 'back' | 'review_status' | 'tags' | 'category' | 'updated_at'
>;

// Archive Flashcard Command Model / DTO
export type ArchiveFlashcardDto = {
  is_archived: boolean;
};

// Response after archiving a flashcard.
export type ArchiveFlashcardResponseDto = {
  id: string;
  is_archived: boolean;
  archived_at: string;
};

// Batch Update Command Model / DTO for multiple flashcards.
export type BatchUpdateFlashcardsDto = {
  flashcard_ids: string[];
  update: Partial<{
    front: string;
    back: string;
    review_status: ReviewStatus;
    tags: string[];
    category: string[];
    is_archived: boolean;
  }>;
};

// Response for a batch flashcard update.
export type BatchUpdateFlashcardsResponseDto = {
  updated_ids: string[];
  message: string;
};

/* ---------------------- AI Flashcard Generation DTOs ---------------------- */

// Command Model for generating flashcards using AI.
export type GenerateFlashcardsDto = {
  text: string; // up to 50k characters
  openrouter_api_key?: string;
};

// Response when an AI flashcard generation task is initiated.
export type GenerateFlashcardsResponseDto = {
  task_id: string;
  status: 'in_progress' | 'completed' | 'failed';
  message: string;
};

// Response for monitoring the flashcard generation progress.
export type FlashcardGenerationStatusResponseDto = {
  task_id: string;
  status: 'in_progress' | 'completed' | 'failed';
  progress: number; // percentage (0 to 100)
  generated_flashcards: FlashcardListItemDto[];
  error?: string | null;
};

/* ---------------------- Archived Flashcards Statistics DTO ---------------------- */

export type ArchivedFlashcardsStatisticsResponseDto = {
  total_archived: number;
  archived_by_category: Record<string, number>;
};
