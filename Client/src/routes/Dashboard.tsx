import { Plus } from 'lucide-react';
import { useState } from 'react';

import { FlashcardList } from '../components/FlashcardList';
import { TextInput } from '../components/TextInput';

import type { Flashcard } from '../db/database.types';

export default function Dashboard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const { flashcards: generatedFlashcards } = await response.json();
      const updatedFlashcards = generatedFlashcards;
      setFlashcards(updatedFlashcards || []);
    } catch (err) {
      console.error(err);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='space-y-12'>
          <TextInput onSubmit={handleSubmit} isLoading={isLoading} />

          {error && <div className='bg-red-50 text-red-700 p-4 rounded-lg'>{error}</div>}

          {isLoading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
              <p className='mt-4 text-gray-600'>Loading flashcards...</p>
            </div>
          ) : flashcards.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
              <Plus className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-4 text-lg font-medium text-gray-900'>No flashcards yet</h3>
              <p className='mt-2 text-gray-600'>
                Get started by pasting some text above to generate your first flashcards.
              </p>
            </div>
          ) : (
            <div className='space-y-6'>
              <h2 className='text-2xl font-semibold text-gray-900'>Your Flashcards</h2>
              <FlashcardList flashcards={flashcards} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
