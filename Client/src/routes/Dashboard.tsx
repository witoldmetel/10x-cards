import { Brain, PenTool, Plus, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { FlashcardList } from '../components/FlashcardList';
import { TextInput } from '../components/TextInput';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFlashcards } from '@/api/flashcard/queries';
import { useCreateFlashcard } from '@/api/flashcard/mutations';

export default function Dashboard() {
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');
  const { data: flashcards = [], isLoading, error } = useFlashcards();
  console.log(' Dashboard ~ flashcards:', flashcards);
  const { mutate: createFlashcard } = useCreateFlashcard();

  const handleSubmit = async (text: string) => {
    createFlashcard({
      front: text,
      back: 'Generated content will go here',
      tags: [],
      category: [],
      creationSource: 'AI',
      reviewStatus: 'New',
    });
  };

  const handleManualSubmit = async () => {
    createFlashcard({
      front: manualQuestion,
      back: manualAnswer,
      tags: [],
      category: [],
      creationSource: 'Manual',
      reviewStatus: 'New',
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-8'>
          <Tabs defaultValue='ai' className='w-full'>
            <TabsList className='grid w-full max-w-md mx-auto grid-cols-2 mb-8'>
              <TabsTrigger value='ai' className='flex items-center gap-2 cursor-pointer hover:text-blue-600'>
                <Brain className='w-4 h-4' />
                AI Generation
              </TabsTrigger>
              <TabsTrigger value='manual' className='flex items-center gap-2 cursor-pointer hover:text-blue-600'>
                <PenTool className='w-4 h-4' />
                Manual Creation
              </TabsTrigger>
            </TabsList>

            <TabsContent value='ai'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Wand2 className='w-5 h-5' />
                    AI-Powered Flashcard Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TextInput onSubmit={handleSubmit} isLoading={isLoading} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='manual'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <PenTool className='w-5 h-5' />
                    Create Flashcard Manually
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className='space-y-6'>
                    <div className='space-y-4'>
                      <div>
                        <Label htmlFor='question'>Question</Label>
                        <Input
                          id='question'
                          value={manualQuestion}
                          onChange={e => setManualQuestion(e.target.value)}
                          placeholder='Enter the question...'
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor='answer'>Answer</Label>
                        <Input
                          id='answer'
                          value={manualAnswer}
                          onChange={e => setManualAnswer(e.target.value)}
                          placeholder='Enter the answer...'
                          required
                        />
                      </div>
                    </div>
                    <Button type='submit' className='w-full'>
                      <Plus className='w-4 h-4 mr-2' />
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
              className='bg-red-50 text-red-700 p-4 rounded-lg'>
              {error}
            </motion.div>
          )}

          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-center py-12 bg-white rounded-lg shadow-sm'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto'></div>
                <h3 className='mt-4 text-lg font-medium text-gray-900'>Loading flashcards...</h3>
              </motion.div>
            ) : flashcards && flashcards.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-6'>
                <h2 className='text-2xl font-semibold text-gray-900'>Your Flashcards</h2>
                <FlashcardList flashcards={flashcards} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-center py-12 bg-white rounded-lg shadow-sm'>
                <Plus className='mx-auto h-12 w-12 text-gray-400' />
                <h3 className='mt-4 text-lg font-medium text-gray-900'>No flashcards yet</h3>
                <p className='mt-2 text-gray-600'>Get started by using AI generation or creating cards manually.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
