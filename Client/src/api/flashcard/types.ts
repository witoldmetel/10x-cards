export interface Flashcard {
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
}

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

export interface CreateFlashcardDTO {
  front: string;
  back: string;
  tags: string[];
  category: string[];
  creationSource: FlashcardCreationSource;
  reviewStatus: ReviewStatus;
  collectionId: string;
}

export interface UpdateFlashcardDTO extends Partial<CreateFlashcardDTO> {
  id: string;
}

export interface GenerateFlashcardsAIRequest {
  source_text: string;
  number_of_cards: number;
  api_model_key?: string;
}

export interface GeneratedAICard {
  front: string;
  back: string;
  tags: string[];
  category: string[];
  creation_source: FlashcardCreationSource;
  review_status: ReviewStatus;
}

export interface GenerateFlashcardsAIResponse {
  flashcards: GeneratedAICard[];
  collection_id: string;
}
