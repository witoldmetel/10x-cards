import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCollections } from '@/api/collections/queries';
import { useCreateCollection } from '@/api/collections/mutations';
import { useCreateFlashcard } from '@/api/flashcard/mutations';
import type { CreateCollection } from '@/api/collections/types';
import { FlashcardCreationSource, ReviewStatus } from '@/api/flashcard/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TagBadge } from '@/components/ui/tag-badge';
import { useState } from 'react';
import { CollectionIcon } from '@/components/collections/CollectionIcon/CollectionIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// --- SCHEMA DEFINITION ---
const flashcardSchema = z.object({
  front: z.string().min(1, 'front is required'),
  back: z.string().min(1, 'back is required'),
});

const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().min(1, 'Collection color is required'),
});

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // light blue
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

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
  const searchParams = new URLSearchParams(location.search);
  const predefinedCollectionId = searchParams.get('collectionId');
  const { data, refetch: fetchCollections, isLoading: isLoadingCollections } = useCollections();
  const { mutateAsync: createCollection, isPending: isCreatingCollection } = useCreateCollection();
  const { mutateAsync: createFlashcard, isPending: isCreatingFlashcard } = useCreateFlashcard();
  const { user } = useAuth();

  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: predefinedCollectionId
      ? {
          flashcards: [{ front: '', back: '' }],
          selectedCollectionId: predefinedCollectionId,
        }
      : {
          collection: { name: '', description: '', color: PRESET_COLORS[9], categories: [], tags: [] },
          flashcards: [{ front: '', back: '' }],
          selectedCollectionId: null,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'flashcards',
  });

  const selectedCollectionId = form.watch('selectedCollectionId');
  const watched = form.watch();
  const isNew = isNewCollectionForm(watched);

  const onSubmit = async (data: FormValues) => {
    let targetCollectionId: string | null = null;

    if (isNewCollectionForm(data) && user?.userId) {
      // Create new collection
      const payload: CreateCollection = {
        name: data.collection.name,
        description: data.collection.description,
        color: data.collection.color,
        categories,
        tags,
      };
      try {
        const collection = await createCollection(payload);
        targetCollectionId = collection.id;
        fetchCollections();
        toast.success('Collection created successfully');
      } catch (e) {
        form.setError('collection.name', { message: 'Failed to create collection' });
        toast.error('Failed to create collection');
        return;
      }
      if (!targetCollectionId) return;
    } else if (isExistingCollectionForm(data)) {
      targetCollectionId = data.selectedCollectionId;
    } else {
      form.setError('selectedCollectionId', { message: 'Invalid collection selection' });
      toast.error('Invalid collection selection');
      return;
    }

    // Create flashcards
    const flashcardCreationErrors: Record<number, { front?: string }> = {};
    let hasFlashcardErrors = false;
    let successCount = 0;

    for (let i = 0; i < data.flashcards.length; i++) {
      const card = data.flashcards[i];
      try {
        await createFlashcard({
          collectionId: targetCollectionId!,
          flashcard: {
            front: card.front,
            back: card.back,
            creationSource: FlashcardCreationSource.Manual,
            reviewStatus: ReviewStatus.Approved,
          },
        });
        successCount++;
      } catch (e) {
        console.error('Error creating flashcard:', e);
        flashcardCreationErrors[i] = { front: 'Failed to create flashcard' };
        hasFlashcardErrors = true;
      }
    }

    if (hasFlashcardErrors) {
      Object.entries(flashcardCreationErrors).forEach(([idx, err]) => {
        form.setError(`flashcards.${idx}.front` as keyof FormValues, { message: err.front });
      });
      toast.error(`Failed to create ${Object.keys(flashcardCreationErrors).length} flashcards`);
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} flashcards`);
      }
      return;
    }

    toast.success(`Successfully created ${data.flashcards.length} flashcards`);
    navigate(`/collections/${targetCollectionId}`);
  };

  const handleAddCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput('');
      toast.success(`Category "${categoryInput.trim()}" added`);
    } else if (categories.includes(categoryInput.trim())) {
      toast.error(`Category "${categoryInput.trim()}" already exists`);
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
    toast.success(`Category "${category}" removed`);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      toast.success(`Tag "${tagInput.trim()}" added`);
    } else if (tags.includes(tagInput.trim())) {
      toast.error(`Tag "${tagInput.trim()}" already exists`);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    toast.success(`Tag "${tag}" removed`);
  };

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} className='mr-2' /> Back to Dashboard
      </Button>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <h1 className='text-3xl font-bold'>Manual Flashcard Generation</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-3 mb-2'>
                <CollectionIcon color={form.watch('collection.color')} size='lg' />
                <CardTitle>Collection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className='mb-4'>
                <FormField
                  name='selectedCollectionId'
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Collection</FormLabel>
                      <Select
                        value={selectedCollectionId || 'new'}
                        disabled={!!predefinedCollectionId}
                        onValueChange={value => {
                          if (value === 'new') {
                            form.reset({
                              collection: {
                                name: '',
                                description: '',
                                color: PRESET_COLORS[9],
                                categories: [],
                                tags: [],
                              },
                              flashcards: [{ front: '', back: '' }],
                              selectedCollectionId: null,
                            });
                          } else {
                            form.reset({
                              flashcards: [{ front: '', back: '' }],
                              selectedCollectionId: value,
                            });
                          }
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select collection' />
                        </SelectTrigger>
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

              {isNew && (
                <div className='grid gap-4'>
                  <FormField
                    control={form.control}
                    name='collection.name'
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

                  <FormField
                    control={form.control}
                    name='collection.description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='A brief description of this flashcard collection'
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='collection.color'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Color</FormLabel>
                        <FormControl>
                          <div className='flex flex-wrap gap-4 items-center'>
                            <div className='flex items-center gap-2'>
                              <div
                                className='w-8 h-8 rounded-full cursor-pointer ring-2 ring-offset-2 ring-gray-200 hover:ring-primary transition-all'
                                style={{ backgroundColor: field.value }}>
                                <input
                                  type='color'
                                  id='color'
                                  {...field}
                                  className='w-8 h-8 rounded-full cursor-pointer opacity-0'
                                  title='Choose custom color'
                                />
                              </div>
                              <span className='text-sm text-gray-500'>Custom</span>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                              {PRESET_COLORS.map(color => (
                                <button
                                  key={color}
                                  type='button'
                                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                                    color === field.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => form.setValue('collection.color', color)}
                                  title='Select preset color'
                                />
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='space-y-2'>
                    <FormLabel>Categories</FormLabel>
                    <div className='flex gap-2'>
                      <Input
                        value={categoryInput}
                        onChange={e => setCategoryInput(e.target.value)}
                        placeholder='Add a category'
                        className='flex-1'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                      />
                      <Button type='button' onClick={handleAddCategory} disabled={!categoryInput.trim()}>
                        Add
                      </Button>
                    </div>
                    {categories.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {categories.map(category => (
                          <div key={category} className='flex items-center'>
                            <TagBadge text={category} variant='category' />
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-5 w-5 p-0 ml-1'
                              onClick={() => handleRemoveCategory(category)}>
                              <X size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <FormLabel>Tags</FormLabel>
                    <div className='flex gap-2'>
                      <Input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        placeholder='Add a tag'
                        className='flex-1'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type='button' onClick={handleAddTag} disabled={!tagInput.trim()}>
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {tags.map(tag => (
                          <div key={tag} className='flex items-center'>
                            <TagBadge text={tag} variant='tag' />
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-5 w-5 p-0 ml-1'
                              onClick={() => handleRemoveTag(tag)}>
                              <X size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Flashcards</h2>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className='pt-6'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-medium'>Card {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => remove(index)}
                      className='h-8 w-8 p-0 text-muted-foreground'>
                      <X size={16} />
                    </Button>
                  )}
                </div>
                <div className='grid gap-4'>
                  <FormField
                    control={form.control}
                    name={`flashcards.${index}.front`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Textarea placeholder='Enter the question' {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`flashcards.${index}.back`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Textarea placeholder='Enter the answer' {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {fields.length < 20 && (
            <Button
              type='button'
              variant='outline'
              className='w-full border-dashed'
              onClick={() => append({ front: '', back: '' })}>
              <Plus size={16} className='mr-1' /> Add Another Card
            </Button>
          )}

          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoadingCollections || isCreatingCollection || isCreatingFlashcard}>
              {isLoadingCollections || isCreatingCollection || isCreatingFlashcard
                ? 'Creating...'
                : selectedCollectionId !== null
                  ? 'Add Flashcards'
                  : 'Create Collection'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
