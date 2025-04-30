import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/text-area';
import { Input } from '@/components/ui/input';
import { useCollections } from '@/api/collections/queries';
import { useGenerateFlashcardsAI } from '@/api/flashcard/mutations';
import { useCreateFlashcard } from '@/api/flashcard/mutations';
import type { GenerateFlashcardsAIRequest, GeneratedAICard, CreateFlashcardDTO, FlashcardCreationSource, ReviewStatus } from '@/api/flashcard/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for AI generation form
const aiGenerateSchema = z.object({
  sourceText: z.string().min(1, 'Please enter some text to generate flashcards from'),
  collectionName: z.string().optional(),
  selectedCollectionId: z.string(), // always a string, never null
  numberOfCards: z.number().min(3).max(20),
}).superRefine((data, ctx) => {
  // Require collectionName if selectedCollectionId is 'new'
  if (data.selectedCollectionId === 'new') {
    if (!data.collectionName || !data.collectionName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Collection name is required',
        path: ['collectionName'],
      });
    }
  }
});
type AIGenerateFormValues = z.infer<typeof aiGenerateSchema>;

export default function AIGenerate() {
  const navigate = useNavigate();
  const { data: collections = [] } = useCollections();
  const generateAI = useGenerateFlashcardsAI();
  const createFlashcard = useCreateFlashcard();

  const [error, setError] = useState<string | null>(null);
  const [generatedCards, setGeneratedCards] = useState<GeneratedAICard[]>([]);
  const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AIGenerateFormValues>({
    resolver: zodResolver(aiGenerateSchema),
    defaultValues: {
      sourceText: '',
      collectionName: '',
      selectedCollectionId: 'new',
      numberOfCards: 5,
    },
  });

  const selectedCollectionId = watch('selectedCollectionId');
  const numberOfCards = watch('numberOfCards');

  const handleBack = () => {
    navigate(-1);
  };

  const handleSelectCollection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('selectedCollectionId', e.target.value);
  };

  const onSubmit = async (data: AIGenerateFormValues) => {
    if (!data.sourceText.trim()) {
      setError('Please enter some text to generate flashcards from');
      return;
    }
    if (data.selectedCollectionId === 'new' && !data.collectionName?.trim()) {
      setError('Please select an existing collection or enter a name for a new one');
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedCards([]);
    setTargetCollectionId(null);

    const collectionId = data.selectedCollectionId;
    const payload: GenerateFlashcardsAIRequest = {
      source_text: data.sourceText,
      number_of_cards: data.numberOfCards,
    };
    try {
      const res = await generateAI.mutateAsync({ collectionId, payload });
      setGeneratedCards(res.flashcards);
      setTargetCollectionId(res.collection_id);
    } catch (err) {
      setError('An error occurred while generating flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCards = async () => {
    if (!targetCollectionId || generatedCards.length === 0) {
      setError('No flashcards to save');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      for (const card of generatedCards) {
        const createPayload: CreateFlashcardDTO = {
          front: card.front,
          back: card.back,
          tags: card.tags,
          category: card.category,
          creationSource: card.creation_source as FlashcardCreationSource,
          reviewStatus: card.review_status as ReviewStatus,
          collectionId: targetCollectionId,
        };
        await createFlashcard.mutateAsync(createPayload);
      }
      navigate(`/collections/${targetCollectionId}`);
    } catch (err) {
      setError('Failed to save flashcards');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className='flex items-center gap-3 mb-6'>
        <Button variant='ghost' onClick={handleBack} className='h-9 w-9 p-0'>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h1 className='text-3xl font-bold'>Generate with AI</h1>
      </div>

      {error && (
        <div className='mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-start'>
          <AlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
          <p>{error}</p>
        </div>
      )}

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2'>
          {!generatedCards.length ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Brain className='h-5 w-5 mr-2 text-primary-600' />
                  Text to Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                  <Textarea
                    label='Enter your text'
                    placeholder='Paste paragraphs, notes, or any text you want to convert into flashcards...'
                    {...register('sourceText')}
                    className='min-h-[200px]'
                    error={errors.sourceText?.message}
                  />
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label htmlFor='collection-select' className='block text-sm font-medium text-neutral-700 mb-1'>
                        Select Collection
                      </label>
                      <select
                        id='collection-select'
                        className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all duration-200'
                        value={selectedCollectionId}
                        onChange={handleSelectCollection}
                        {...register('selectedCollectionId')}
                      >
                        <option value='new'>Create New Collection</option>
                        {collections.map(collection => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedCollectionId === 'new' && (
                      <Input
                        label='New Collection Name'
                        placeholder='e.g., History Notes'
                        {...register('collectionName')}
                        error={errors.collectionName?.message}
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor='card-count' className='block text-sm font-medium text-neutral-700 mb-1'>
                      Number of Cards to Generate
                    </label>
                    <div className='flex items-center gap-4'>
                      <input
                        type='range'
                        id='card-count'
                        min='3'
                        max='20'
                        {...register('numberOfCards', { valueAsNumber: true })}
                        value={numberOfCards}
                        className='flex-1'
                      />
                      <span className='font-medium text-lg w-8 text-center'>{numberOfCards}</span>
                    </div>
                    {errors.numberOfCards && (
                      <span className='text-error-600 text-sm'>{errors.numberOfCards.message}</span>
                    )}
                  </div>
                  <Button
                    type='submit'
                    variant='primary'
                    className='w-full'
                    leftIcon={<Sparkles className='h-4 w-4' />}
                    isLoading={isGenerating}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div>
              <Card className='mb-6'>
                <CardHeader>
                  <CardTitle>Generated Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='mb-4'>
                    We've generated {generatedCards.length} flashcards based on your text. You can edit them before
                    saving.
                  </p>
                </CardContent>
              </Card>
              <div className='space-y-4'>
                {generatedCards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className='pt-5'>
                        <div className='space-y-4'>
                          <div>
                            <h3 className='font-medium mb-2'>Question</h3>
                            <Textarea
                              value={card.front}
                              onChange={e => {
                                const updatedCards = [...generatedCards];
                                updatedCards[index] = {
                                  ...updatedCards[index],
                                  front: e.target.value,
                                };
                                setGeneratedCards(updatedCards);
                              }}
                            />
                          </div>
                          <div>
                            <h3 className='font-medium mb-2'>Answer</h3>
                            <Textarea
                              value={card.back}
                              onChange={e => {
                                const updatedCards = [...generatedCards];
                                updatedCards[index] = {
                                  ...updatedCards[index],
                                  back: e.target.value,
                                };
                                setGeneratedCards(updatedCards);
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className='mt-6 flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setGeneratedCards([]);
                    setTargetCollectionId(null);
                  }}
                >
                  Go Back
                </Button>
                <Button variant='primary' onClick={handleSaveCards} isLoading={isSaving} disabled={isSaving}>
                  Save All Flashcards
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className='md:col-span-1'>
          <div className='sticky top-20'>
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className='space-y-4 list-decimal list-inside text-neutral-700'>
                  <li>
                    <span className='font-medium text-neutral-900'>Input your text</span>
                    <p className='mt-1 pl-5 text-sm'>
                      Paste any content you want to learn - lecture notes, articles, book chapters, or study materials.
                    </p>
                  </li>
                  <li>
                    <span className='font-medium text-neutral-900'>AI generates flashcards</span>
                    <p className='mt-1 pl-5 text-sm'>
                      Our AI analyzes your text and creates question-answer pairs focused on key concepts.
                    </p>
                  </li>
                  <li>
                    <span className='font-medium text-neutral-900'>Review and edit</span>
                    <p className='mt-1 pl-5 text-sm'>
                      Tweak the generated flashcards to better suit your learning style.
                    </p>
                  </li>
                  <li>
                    <span className='font-medium text-neutral-900'>Save and study</span>
                    <p className='mt-1 pl-5 text-sm'>
                      Add the flashcards to your collection and start studying with our spaced repetition system.
                    </p>
                  </li>
                </ol>
                <div className='mt-6 p-3 bg-primary-50 border border-primary-200 rounded-lg'>
                  <p className='text-sm text-primary-800'>
                    <span className='font-medium'>Pro tip:</span> For best results, use clear, structured text with
                    well-defined concepts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
