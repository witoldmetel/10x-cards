export interface Flashcard {
  id: string;
  front: string;
  back: string;
  userId: string;
  tags: string[];
  category: string[];
  creationSource: 'AI' | 'Manual';
  reviewStatus: 'New' | 'In Progress' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardDTO {
  front: string;
  back: string;
  tags: string[];
  category: string[];
  creationSource: 'AI' | 'Manual';
  // @todo: for creation, we should have a default value - New
  reviewStatus: 'New' | 'In Progress' | 'Completed';
}

export interface UpdateFlashcardDTO extends Partial<CreateFlashcardDTO> {
  id: string;
}
