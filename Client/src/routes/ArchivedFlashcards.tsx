import { useState, useEffect } from 'react';
import { FlashcardList } from '../components/FlashcardList';
import type { Flashcard } from '../db/database.types';

interface ArchivedStatistics {
  totalArchived: number;
  archivedByCategory: Record<string, number>;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export default function ArchivedFlashcards() {
  const [archivedCards, setArchivedCards] = useState<Flashcard[]>([]);
  const [statistics, setStatistics] = useState<ArchivedStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchArchivedCards();
    fetchStatistics();
  }, [page]);

  const fetchArchivedCards = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/flashcards/archived?page=${page}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch archived flashcards');
      }

      const data: PaginatedResponse<Flashcard> = await response.json();
      
      if (page === 1) {
        setArchivedCards(data.items);
      } else {
        setArchivedCards(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.items.length === 20);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch archived flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/flashcards/archived/statistics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch archive statistics');
      }

      const data: ArchivedStatistics = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error(err);
      // We don't set the error state here as it's not critical
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Archived Flashcards</h1>
            {statistics && (
              <div className='text-gray-600'>
                <p className='text-lg'>Total archived: {statistics.totalArchived}</p>
                <div className='text-sm mt-1'>
                  {Object.entries(statistics.archivedByCategory).map(([category, count]) => (
                    <span key={category} className='mr-4'>
                      {category}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className='bg-red-50 text-red-700 p-4 rounded-lg mb-6'>
              {error}
            </div>
          )}

          {isLoading && page === 1 ? (
            <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
              <p className='mt-4 text-gray-600'>Loading archived flashcards...</p>
            </div>
          ) : archivedCards.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
              <p className='text-lg text-gray-600'>No archived flashcards found.</p>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <FlashcardList flashcards={archivedCards} />
              </div>
              {hasMore && (
                <div className='text-center pt-4'>
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
