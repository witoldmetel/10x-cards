import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { useCollections } from '@/api/collections/queries';
import { useCreateCollection } from '@/api/collections/mutations';
import { useCreateFlashcard } from '@/api/flashcard/mutations';
import type { CreateCollectionDto } from '@/api/collections/types';
import { FlashcardCreationSource, ReviewStatus } from '@/api/flashcard/types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

// --- SCHEMA DEFINITION ---
const flashcardSchema = z.object({
  front: z.string().min(1, 'front is required'),
  back: z.string().min(1, 'back is required'),
});

const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  color: z.string().min(1, 'Collection color is required'),
});

// For "Create New Collection"
const newCollectionFormSchema = z.object({
  collection: collectionSchema,
  flashcards: z.array(flashcardSchema).min(1, 'At least one flashcard is required'),
  selectedCollectionId: z.literal(null),
});

// For "Existing Collection"
const existingCollectionFormSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1, 'At least one flashcard is required'),
  selectedCollectionId: z.string().min(1, 'Collection must be selected'),
});

// Union schema for useForm
const formSchema = z.union([newCollectionFormSchema, existingCollectionFormSchema]);

type FormValues = z.infer<typeof formSchema>;

// Helper type guards for discriminated union
function isNewCollectionForm(data: FormValues): data is z.infer<typeof newCollectionFormSchema> {
  return data.selectedCollectionId === null;
}

function isExistingCollectionForm(data: FormValues): data is z.infer<typeof existingCollectionFormSchema> {
  return typeof data.selectedCollectionId === 'string' && data.selectedCollectionId !== '';
}

export default function ManualGenerate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, refetch: fetchCollections, isLoading: isLoadingCollections } = useCollections();
  const { mutateAsync: createCollection, isPending: isCreatingCollection } = useCreateCollection();
  const { mutateAsync: createFlashcard, isPending: isCreatingFlashcard } = useCreateFlashcard();
  const { userId } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: location.state?.collectionId
      ? {
          flashcards: [{ front: '', back: '' }],
          selectedCollectionId: location.state.collectionId,
        }
      : {
          collection: { name: '', description: '', color: '#3B82F6' },
          flashcards: [{ front: '', back: '' }],
          selectedCollectionId: null,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'flashcards',
  });

  const selectedCollectionId = watch('selectedCollectionId');
  const watched = watch();
  const isNew = isNewCollectionForm(watched);
  const errorsCollection = isNew ? ((errors as any).collection ?? {}) : {};

  const onSubmit = async (data: FormValues) => {
    let targetCollectionId: string | null = null;

    if (isNewCollectionForm(data) && userId) {
      // Create new collection
      const payload: CreateCollectionDto = {
        name: data.collection.name,
        description: data.collection.description,
        color: data.collection.color,
        userId: userId,
      };
      try {
        const collection = await createCollection(payload);
        targetCollectionId = collection.id;
        fetchCollections();
      } catch (e) {
        setError('collection.name', { message: 'Failed to create collection' });
        return;
      }
      if (!targetCollectionId) return;
    } else if (isExistingCollectionForm(data)) {
      targetCollectionId = data.selectedCollectionId;
    } else {
      setError('selectedCollectionId', { message: 'Invalid collection selection' });
      return;
    }

    // Create flashcards
    let flashcardCreationErrors: Record<number, { front?: string }> = {};
    let hasFlashcardErrors = false;
    for (let i = 0; i < data.flashcards.length; i++) {
      const card = data.flashcards[i];
      try {
        await createFlashcard({
          collectionId: targetCollectionId!,
          flashcard: {
            front: card.front,
            back: card.back,
            tags: [],
            category: [],
            creationSource: FlashcardCreationSource.Manual,
            reviewStatus: ReviewStatus.Approved,
          },
        });
      } catch (e) {
        console.error('Error creating flashcard:', e);
        flashcardCreationErrors[i] = { front: 'Failed to create flashcard' };
        hasFlashcardErrors = true;
      }
    }
    if (hasFlashcardErrors) {
      Object.entries(flashcardCreationErrors).forEach(([idx, err]) => {
        setError(`flashcards.${idx}.front` as any, { message: err.front });
      });
      return;
    }

    navigate(`/collections/${targetCollectionId}`);
  };

  return (
    <div>
      <div className='flex items-center gap-3 mb-6'>
        <Button variant='ghost' onClick={() => navigate(-1)} className='h-9 w-9 p-0'>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h1 className='text-3xl font-bold'>Create Flashcards</h1>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2'>
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='mb-4'>
                <label htmlFor='collection-select' className='block text-sm font-medium text-neutral-700 mb-1'>
                  Select Collection
                </label>
                <select
                  id='collection-select'
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all duration-200'
                  value={selectedCollectionId || 'new'}
                  onChange={e => {
                    const value = e.target.value;

                    if (value === 'new') {
                      reset({
                        collection: { name: '', description: '', color: '#3B82F6' },
                        flashcards: [{ front: '', back: '' }],
                        selectedCollectionId: null,
                      });
                    } else {
                      reset({
                        flashcards: [{ front: '', back: '' }],
                        selectedCollectionId: value,
                      });
                    }
                  }}>
                  <option value='new'>Create New Collection</option>
                  {data?.collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              {isNew && (
                <div className='space-y-4'>
                  <Controller
                    name='collection.name'
                    control={control}
                    render={({ field }) => (
                      <Input
                        label='Collection Name'
                        {...field}
                        placeholder='e.g., Spanish Vocabulary'
                        error={errorsCollection?.name?.message}
                      />
                    )}
                  />

                  <Controller
                    name='collection.description'
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        label='Description'
                        {...field}
                        placeholder='Describe what this collection is about...'
                        error={errorsCollection?.description?.message}
                      />
                    )}
                  />

                  <div>
                    <label htmlFor='color' className='block text-sm font-medium text-neutral-700 mb-1'>
                      Color
                    </label>
                    <div className='flex items-center gap-3'>
                      <Controller
                        name='collection.color'
                        control={control}
                        render={({ field }) => (
                          <input type='color' id='color' {...field} className='h-10 w-10 rounded cursor-pointer' />
                        )}
                      />
                      <span className='text-neutral-600'>{watched.collection?.color}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className='mb-4 flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Flashcards</h2>
            <Button
              variant='outline'
              leftIcon={<Plus className='h-4 w-4' />}
              onClick={() => append({ front: '', back: '' })}>
              Add Card
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className='mb-4'>
              <CardContent className='pt-5'>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <h3 className='font-medium'>Card {index + 1}</h3>
                    {fields.length > 1 && (
                      <Button
                        variant='ghost'
                        className='h-8 w-8 p-0 text-error-500 hover:bg-error-50'
                        onClick={() => remove(index)}
                        aria-label='Remove card'>
                        <Plus className='h-5 w-5 rotate-45' />
                      </Button>
                    )}
                  </div>

                  <Controller
                    name={`flashcards.${index}.front`}
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        label='front'
                        {...field}
                        placeholder='Enter your front...'
                        error={errors.flashcards?.[index]?.front?.message}
                      />
                    )}
                  />

                  <Controller
                    name={`flashcards.${index}.back`}
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        label='back'
                        {...field}
                        placeholder='Enter the back...'
                        error={errors.flashcards?.[index]?.back?.message}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='md:col-span-1'>
          <div className='sticky top-20'>
            <Card>
              <CardHeader>
                <CardTitle>Save Flashcards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-neutral-600 mb-4'>
                  You're creating {fields.length} flashcard{fields.length !== 1 ? 's' : ''} in{' '}
                  {selectedCollectionId ? 'an existing collection' : 'a new collection'}.
                </p>

                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Cards:</span>
                    <span>{fields.length}</span>
                  </div>

                  <div className='flex justify-between'>
                    <span>Collection:</span>
                    <span>
                      {selectedCollectionId
                        ? data?.collections.find(c => c.id === selectedCollectionId)?.name || 'Loading...'
                        : isNew
                          ? 'New - ' + (watched.collection?.name || 'Unnamed')
                          : 'Select a collection'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant='primary'
                  className='w-full'
                  leftIcon={<Save className='h-4 w-4' />}
                  onClick={handleSubmit(onSubmit)}
                  isLoading={isLoadingCollections || isCreatingCollection || isCreatingFlashcard}>
                  Save Flashcards
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
