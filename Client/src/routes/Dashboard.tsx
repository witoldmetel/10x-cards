import { Brain, PenTool, Plus, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



import { FlashcardList } from '../components/FlashcardList';
import { TextInput } from '../components/TextInput';

import type { Flashcard } from '../db/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');

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

      const response = await fetch(`http://localhost:5001/api/flashcards?${buildQueryString(queryParams)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to fetch flashcards (${response.status})`);
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
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          front: text,
          back: 'Generated content will go here',
          tags: [],
          category: [],
          creationSource: 'Manual',
          reviewStatus: 'New',
        }),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to create flashcard (${response.status})`);
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
     <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Generation
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Manual Creation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    AI-Powered Flashcard Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TextInput onSubmit={handleSubmit} isLoading={isLoading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    Create Flashcard Manually
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="question">Question</Label>
                        <Input
                          id="question"
                          value={manualQuestion}
                          onChange={(e) => setManualQuestion(e.target.value)}
                          placeholder="Enter the question..."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="answer">Answer</Label>
                        <Input
                          id="answer"
                          value={manualAnswer}
                          onChange={(e) => setManualAnswer(e.target.value)}
                          placeholder="Enter the answer..."
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Flashcard
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-700 p-4 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence>
            {flashcards.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900">
                  Your Flashcards
                </h2>
                <FlashcardList flashcards={flashcards} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm"
              >
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No flashcards yet</h3>
                <p className="mt-2 text-gray-600">
                  Get started by using AI generation or creating cards manually.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
