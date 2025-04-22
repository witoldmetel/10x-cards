import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

import { FlashcardList } from '../components/FlashcardList';
import { TextInput } from '../components/TextInput';

import type { Flashcard } from '../db/database.types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface FlashcardsQueryParams {
  page: number;
  limit: number;
  reviewStatus?: string;
  searchPhrase?: string;
  tag?: string;
  category?: string;
}

export default function Dashboard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, [page]);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const buildQueryString = (params: FlashcardsQueryParams): string => {
    const queryParams = new URLSearchParams();
    
    // Add required parameters
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    
    // Add optional parameters if they exist
    if (params.reviewStatus) queryParams.append('reviewStatus', params.reviewStatus);
    if (params.searchPhrase) queryParams.append('searchPhrase', params.searchPhrase);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.category) queryParams.append('category', params.category);
    
    return queryParams.toString();
  };

  const fetchFlashcards = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams: FlashcardsQueryParams = {
        page,
        limit: 20,
      };

      const response = await fetch(
        `http://localhost:5001/api/flashcards?${buildQueryString(queryParams)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );
      
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Failed to fetch flashcards (${response.status})`
        );
      }

      const data: PaginatedResponse<Flashcard> = await response.json();
      
      if (page === 1) {
        setFlashcards(data.items);
      } else {
        setFlashcards(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.items.length === 20);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          front: text,
          back: "Generated content will go here",
          tags: [],
          category: [],
          creationSource: "Manual",
          reviewStatus: "New"
        }),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Failed to create flashcard (${response.status})`
        );
      }

      const newFlashcard = await response.json();
      setFlashcards(prev => [newFlashcard, ...prev]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create flashcard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='space-y-12'>
          <TextInput onSubmit={handleSubmit} isLoading={isLoading} />

          {error && (
            <div className='bg-red-50 text-red-700 p-4 rounded-lg'>
              <p className='font-medium'>Error</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading && page === 1 ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
              <p className='mt-4 text-gray-600'>Loading flashcards...</p>
            </div>
          ) : flashcards.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
              <Plus className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-4 text-lg font-medium text-gray-900'>No flashcards yet</h3>
              <p className='mt-2 text-gray-600'>
                Get started by creating your first flashcard above.
              </p>
            </div>
          ) : (
            <div className='space-y-6'>
              <h2 className='text-2xl font-semibold text-gray-900'>Your Flashcards</h2>
              <FlashcardList flashcards={flashcards} />
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
