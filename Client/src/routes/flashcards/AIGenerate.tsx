import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, Check, X, HelpCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useCollections } from '@/api/collections/queries';
import { useGenerateFlashcardsAI, useUpdateFlashcard } from '@/api/flashcard/mutations';
import { useCreateFlashcard } from '@/api/flashcard/mutations';
import type { GenerateFlashcardsRequest } from '@/api/flashcard/types';
import { FlashcardCreationSource, ReviewStatus } from '@/api/flashcard/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCollection } from '@/api/collections/mutations';
import type { Flashcard } from '@/api/flashcard/types';
import { Tabs } from '@radix-ui/react-tabs';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const aiGenerateSchema = z
  .object({
    sourceText: z.string().min(1, 'Please enter some text to generate flashcards from'),
    collectionName: z.string().optional(),
    selectedCollectionId: z.string(),
    count: z.number().min(3).max(20),
  })
  .superRefine((data, ctx) => {
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
  const { data } = useCollections();
  const generateAI = useGenerateFlashcardsAI();
  const createCollectionMutation = useCreateCollection();
  const updateFlashcardMutation = useUpdateFlashcard();

  const [error, setError] = useState<string | null>(null);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [generationStep, setGenerationStep] = useState<'idle' | 'uploading' | 'processing' | 'reviewing'>('idle');
  const [activeTab, setActiveTab] = useState<'generate' | 'review'>('generate');

  const form = useForm<AIGenerateFormValues>({
    resolver: zodResolver(aiGenerateSchema),
    defaultValues: {
      sourceText: '',
      collectionName: '',
      selectedCollectionId: 'new',
      count: 5,
    },
  });

  const selectedCollectionId = form.watch('selectedCollectionId');

  const startGeneration = async (data: AIGenerateFormValues) => {
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
    setGenerationStep('uploading');

    let collectionId = data.selectedCollectionId;

    try {
      if (collectionId === 'new' && data.collectionName) {
        const newCollection = await createCollectionMutation.mutateAsync({
          name: data.collectionName,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        });

        collectionId = newCollection.id;
      }

      const payload: GenerateFlashcardsRequest = {
        sourceText: data.sourceText,
        count: data.count,
      };

      try {
        const response = await generateAI.mutateAsync({
          collectionId,
          payload,
          onProgress: progress => {
            setProgressPercentage(progress);
            if (progress === 100) {
              setGenerationStep('processing');
              toast.success('Upload complete! Processing your flashcards...');
            }
          },
        });

        setGeneratedCards(response);
        setGenerationStep('reviewing');
        setProgressPercentage(0);
        setTargetCollectionId(collectionId);
        toast.success('Flashcards generated successfully! You can now review and edit them.');
        form.setValue('selectedCollectionId', 'new');
        form.setValue('sourceText', '');
        form.setValue('collectionName', '');
        setActiveTab('review');
      } catch (error) {
        console.error('Generation error:', error);
        toast.warning('Failed to generate flashcards. You can try generating them again or create them manually.');
        navigate(`/collections/${collectionId}`);
      }
    } catch (error) {
      console.error('Collection creation error:', error);
      toast.error('Failed to create collection. Please try again.');
      setGenerationStep('idle');
      setProgressPercentage(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCollection = async () => {
    try {
      if (generatedCards.length === 0) {
        toast.error('Please accept or correct at least one flashcard');
        return;
      }

      if (!targetCollectionId) {
        toast.error('Please select a collection');
        return;
      }

      // Disable the save button to prevent multiple clicks
      setIsGenerating(true);

      try {
        // Save cards one by one to prevent race conditions
        for (const card of generatedCards) {
          const updatePayload = {
            id: card.id,
            flashcard: {
              front: card.front,
              back: card.back,
              reviewStatus: card.reviewStatus,
            },
          };

          await updateFlashcardMutation.mutateAsync(updatePayload);
        }

        toast.success('Collection saved successfully!');
        navigate(`/collections/${targetCollectionId}`);
      } catch (error) {
        console.error('Failed to save flashcards:', error);
        toast.error('Failed to save some flashcards. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Failed to save collection:', error);
      toast.error('Failed to save collection. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleKeepCard = (id: string) => {
    setGeneratedCards(prev =>
      prev.map(card =>
        card.id === id
          ? {
              ...card,
              reviewStatus: ReviewStatus.Approved,
            }
          : card,
      ),
    );
  };

  const handleCorrectCard = (id: string) => {
    setGeneratedCards(prev =>
      prev.map(card =>
        card.id === id
          ? {
              ...card,
              reviewStatus: ReviewStatus.ToCorrect,
            }
          : card,
      ),
    );
  };

  const handleRemoveCard = (id: string) => {
    setGeneratedCards(prev =>
      prev.map(card =>
        card.id === id
          ? {
              ...card,
              reviewStatus: ReviewStatus.Rejected,
            }
          : card,
      ),
    );
  };

  const howItWorksContent = (
    <div className='space-y-4'>
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
          <p className='mt-1 pl-5 text-sm'>Tweak the generated flashcards to better suit your learning style.</p>
        </li>
        <li>
          <span className='font-medium text-neutral-900'>Save and study</span>
          <p className='mt-1 pl-5 text-sm'>
            Add the flashcards to your collection and start studying with our spaced repetition system.
          </p>
        </li>
      </ol>
      <div className='mt-6 p-3 bg-background border border-primary-200 rounded-lg'>
        <p className='text-sm text-primary-800'>
          <span className='font-medium'>Pro tip:</span> For best results, use clear, structured text with well-defined
          concepts.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} className='mr-2' /> Back to Dashboard
      </Button>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <h1 className='text-3xl font-bold'>AI Flashcard Generation</h1>

        <div className='flex items-center'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' size='icon' className='rounded-full'>
                <HelpCircle className='h-5 w-5' />
                <span className='sr-only'>How it works</span>
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[600px] bg-white'>
              <DialogHeader>
                <DialogTitle>How It Works</DialogTitle>
                <DialogDescription asChild>{howItWorksContent}</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className='mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-start'>
          <AlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
          <p>{error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'generate' | 'review')}>
        <TabsList className='mb-6'>
          <TabsTrigger value='generate' disabled={isGenerating && generationStep !== 'idle'} data-value='generate'>
            Generate
          </TabsTrigger>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className='inline-flex'>
                  <TabsTrigger value='review' disabled={generationStep !== 'reviewing'} data-value='review'>
                    Review & Edit
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate flashcards first</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>

        <TabsContent value='generate'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(startGeneration)} className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle>Source Material</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div className='mb-4'>
                      <FormField
                        control={form.control}
                        name='selectedCollectionId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Collection</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select visibility' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='new'>Create New Collection</SelectItem>
                                {data?.collections.map(collection => (
                                  <SelectItem key={collection.id} value={collection.id}>
                                    {collection.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {selectedCollectionId === 'new' && (
                      <FormField
                        control={form.control}
                        name='collectionName'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collection Title</FormLabel>
                            <FormControl>
                              <Input placeholder='e.g., Biology 101' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name='sourceText'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Paste your text here (up to 50,000 characters)'
                            className='min-h-[200px]'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>{field.value.length} / 50,000 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='count'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Cards to Generate</FormLabel>
                        <FormControl>
                          <div className='flex items-center gap-4'>
                            <span className='text-sm text-muted-foreground'>{field.value} cards</span>
                            <input
                              type='range'
                              id='card-count'
                              min='3'
                              max='20'
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              className='flex-1'
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {(generationStep === 'uploading' || generationStep === 'processing') && (
                <Card>
                  <CardContent className='pt-6'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>
                          {generationStep === 'uploading'
                            ? 'Uploading content...'
                            : generationStep === 'processing'
                              ? 'Generating flashcards...'
                              : 'Finalizing...'}
                        </p>
                        <span className='text-sm'>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className='h-2' />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className='flex justify-end'>
                <Button type='submit' disabled={isGenerating} className='w-full sm:w-auto'>
                  {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value='review'>
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Generated Flashcards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-4'>
                  Review each flashcard and decide whether to keep or reject it. You can also edit the content before
                  saving.
                </p>

                <div className='space-y-4 mt-6'>
                  {generatedCards.map(flashcard => (
                    <Card
                      key={flashcard.id}
                      className={`relative ${
                        flashcard.reviewStatus === ReviewStatus.Approved
                          ? 'border-2 border-primary bg-primary/5'
                          : flashcard.reviewStatus === ReviewStatus.ToCorrect
                            ? 'border-2 border-secondary bg-secondary/5'
                            : flashcard.reviewStatus === ReviewStatus.Rejected
                              ? 'border-2 border-destructive bg-destructive/5 opacity-50'
                              : 'border-2 border-yellow-500 bg-yellow-50'
                      }`}>
                      {flashcard.reviewStatus === ReviewStatus.Approved && (
                        <div className='absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium'>
                          Accepted
                        </div>
                      )}
                      {flashcard.reviewStatus === ReviewStatus.ToCorrect && (
                        <div className='absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium'>
                          To Correct
                        </div>
                      )}
                      {flashcard.reviewStatus === ReviewStatus.Rejected && (
                        <div className='absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-medium'>
                          Rejected
                        </div>
                      )}
                      {flashcard.reviewStatus === ReviewStatus.New && (
                        <div className='absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium'>
                          Needs Review
                        </div>
                      )}
                      <CardContent className='pt-6'>
                        <div className='mb-4'>
                          <p className='font-medium text-sm text-muted-foreground'>Question:</p>
                          <p className='mt-1 text-lg'>{flashcard.front}</p>
                        </div>
                        <div className='mb-6'>
                          <p className='font-medium text-sm text-muted-foreground'>Answer:</p>
                          <p className='mt-1 text-lg'>{flashcard.back}</p>
                        </div>
                        <div className='flex justify-between items-center'>
                          <div className='flex gap-2'>
                            <Button
                              type='button'
                              size='sm'
                              variant={flashcard.reviewStatus === ReviewStatus.Approved ? 'default' : 'outline'}
                              className={`${
                                flashcard.reviewStatus === ReviewStatus.Approved
                                  ? 'bg-primary hover:bg-primary/90'
                                  : 'hover:border-primary hover:text-primary'
                              }`}
                              onClick={() => handleKeepCard(flashcard.id)}>
                              <Check size={16} className='mr-1' />
                              Keep
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              variant={flashcard.reviewStatus === ReviewStatus.ToCorrect ? 'secondary' : 'outline'}
                              className={`${
                                flashcard.reviewStatus === ReviewStatus.ToCorrect
                                  ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                                  : 'hover:border-secondary hover:text-secondary-foreground'
                              }`}
                              onClick={() => handleCorrectCard(flashcard.id)}>
                              <Pencil size={16} className='mr-1' />
                              Correct
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              variant={flashcard.reviewStatus === ReviewStatus.Rejected ? 'destructive' : 'outline'}
                              className={`${
                                flashcard.reviewStatus === ReviewStatus.Rejected
                                  ? 'bg-destructive hover:bg-destructive/90'
                                  : 'hover:border-destructive hover:text-destructive'
                              }`}
                              onClick={() => handleRemoveCard(flashcard.id)}>
                              <X size={16} className='mr-1' />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className='flex justify-between items-center gap-4'>
              <p className='text-sm text-muted-foreground'>
                {generatedCards.filter(card => card.reviewStatus === ReviewStatus.Approved).length} approved,{' '}
                {generatedCards.filter(card => card.reviewStatus === ReviewStatus.ToCorrect).length} to correct,{' '}
                {generatedCards.filter(card => card.reviewStatus === ReviewStatus.New).length} need review
              </p>
              <div className='flex gap-4'>
                <Button type='button' variant='outline' onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button
                  type='button'
                  onClick={saveCollection}
                  disabled={
                    isGenerating ||
                    generatedCards.some(card => card.reviewStatus === ReviewStatus.New) ||
                    !generatedCards.some(
                      card =>
                        card.reviewStatus === ReviewStatus.Approved || card.reviewStatus === ReviewStatus.ToCorrect,
                    )
                  }>
                  {isGenerating ? 'Saving...' : 'Save Collection'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
