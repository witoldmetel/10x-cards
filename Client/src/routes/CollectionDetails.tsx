import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Plus, Edit, Trash2, ArrowLeft, BookOpen, X, Check, Archive } from 'lucide-react';

import { useCollection } from '../api/collections/queries';
import { useDeleteCollection, useArchiveCollection } from '../api/collections/mutations';
import { useDeleteFlashcard, useUpdateFlashcard, useArchiveFlashcard } from '@/api/flashcard/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/text-area';
import type { Flashcard as FlashcardType } from '@/api/flashcard/types';
import { ReviewStatus } from '@/api/flashcard/types';
import { Flashcard } from '@/components/Flashcard';

export default function CollectionDetails() {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();

  const {
    data: collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollection(collectionId || '');
  // Delete collection mutation
  const deleteCollectionMutation = useDeleteCollection();
  const archiveCollectionMutation = useArchiveCollection();
  // Delete flashcard mutation
  const deleteFlashcardMutation = useDeleteFlashcard();
  // Update flashcard mutation
  const updateFlashcardMutation = useUpdateFlashcard();
  const archiveFlashcardMutation = useArchiveFlashcard();

  const [previewCard, setPreviewCard] = useState<FlashcardType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ front: '', back: '' });


  const handleBack = () => navigate('/dashboard');
  const handleStudy = () => collectionId && navigate(`/study/${collectionId}`);
  const handleArchiveCollection = async () => {
    if (!collectionId) return;
    await archiveCollectionMutation.mutateAsync(collectionId);
    navigate('/dashboard');
  };

  const handleDeleteCollection = async () => {
    if (!collectionId) return;
    await deleteCollectionMutation.mutateAsync(collectionId);
    navigate('/dashboard');
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (previewCard?.id === flashcardId) {
      setPreviewCard(null);
    }
    await deleteFlashcardMutation.mutateAsync(flashcardId);
  };

  const handleArchiveFlashcard = async (flashcardId: string) => {
    if (previewCard?.id === flashcardId) {
      setPreviewCard(null);
    }
    await archiveFlashcardMutation.mutateAsync(flashcardId);
  };

  const handlePreviewCard = (card: FlashcardType) => {
    if (editingCard !== card.id) {
      setPreviewCard(card);
    }
  };

  const handleEditCard = (card: FlashcardType) => {
    setEditingCard(card.id);
    setEditForm({ front: card.front, back: card.back });
    setPreviewCard(null);
  };

  const handleSaveEdit = async (cardId: string) => {
    if (editForm.front.trim() && editForm.back.trim()) {
      await updateFlashcardMutation.mutateAsync({
        id: cardId,
        flashcard: {
          front: editForm.front,
          back: editForm.back,
        },
      });
      setEditingCard(null);
      setEditForm({ front: '', back: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditForm({ front: '', back: '' });
  };


  if (isCollectionLoading) {
    return <LoadingState />;
  }

  if (isCollectionError || !collection) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-2xl font-semibold mb-4'>Collection not found</h2>
        <Button variant='primary' onClick={handleBack}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center gap-3 mb-6'>
        <Button variant='ghost' onClick={handleBack} className='h-9 w-9 p-0'>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h1 className='text-3xl font-bold'>{collection.name}</h1>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Flashcards ({collection.flashcards.length})</h2>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setIsDeleteModalOpen(true)}>
                Delete Collection
              </Button>
              <Button variant='outline' onClick={handleArchiveCollection} leftIcon={<Archive className='h-4 w-4' />}>
                Archive Collection
              </Button>
              <Button variant='primary' leftIcon={<Plus className='h-4 w-4' />} onClick={() => navigate('/generate/manual')}>
                Add Flashcard
              </Button>
            </div>
          </div>

          {collection.flashcards.length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <BookOpen className='h-12 w-12 mx-auto text-neutral-300 mb-4' />
                <h3 className='text-xl font-semibold mb-2'>No flashcards yet</h3>
                <p className='text-neutral-600 mb-4'>Start adding flashcards to build your collection</p>
                <Button variant='primary' onClick={() => navigate('/generate/manual')}>
                  Add First Flashcard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {collection.flashcards.map(card => (
                <Card
                  key={card.id}
                  className={`hover:border-primary-300 transition-colors ${editingCard === card.id ? 'border-primary-300' : ''}`}
                  onClick={() => handlePreviewCard(card)}>
                  <CardContent className='py-4'>
                    {editingCard === card.id ? (
                      <div className='space-y-4' onClick={e => e.stopPropagation()}>
                        <Textarea
                          label='Question'
                          value={editForm.front}
                          onChange={e => setEditForm(prev => ({ ...prev, front: e.target.value }))}
                          placeholder='Enter question...'
                        />
                        <Textarea
                          label='Answer'
                          value={editForm.back}
                          onChange={e => setEditForm(prev => ({ ...prev, back: e.target.value }))}
                          placeholder='Enter answer...'
                        />
                        <div className='flex justify-end gap-2 mt-4'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={handleCancelEdit}
                            leftIcon={<X className='h-4 w-4' />}>
                            Cancel
                          </Button>
                          <Button
                            variant='primary'
                            size='sm'
                            onClick={() => handleSaveEdit(card.id)}
                            leftIcon={<Check className='h-4 w-4' />}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-medium text-lg mb-1'>{card.front}</h3>
                          <p className='text-neutral-600 line-clamp-1'>{card.back}</p>
                        </div>
                        <div className='flex items-start ml-4 gap-2'>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0'
                            onClick={e => {
                              e.stopPropagation();
                              handleEditCard(card);
                            }}>
                            <Edit className='h-4 w-4 text-neutral-500' />
                          </Button>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0'
                            onClick={e => {
                              e.stopPropagation();
                              handleArchiveFlashcard(card.id);
                            }}>
                            <Archive className='h-4 w-4 text-neutral-500' />
                          </Button>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0'
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteFlashcard(card.id);
                            }}>
                            <Trash2 className='h-4 w-4 text-error-500' />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className='md:col-span-1'>
          <div className='sticky top-20'>
            <Card className='mb-6'>
              <CardHeader>
                <CardTitle>Collection Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm text-neutral-500'>Description</p>
                    <p>{collection.description}</p>
                  </div>
                  <div>
                    <p className='text-sm text-neutral-500'>Total Cards</p>
                    <p>{collection.flashcards.length}</p>
                  </div>
                  <div>
                    <p className='text-sm text-neutral-500'>Cards Due for Review</p>
                    <p>{collection.flashcards.filter(f => f.reviewStatus === ReviewStatus.New).length}</p>
                  </div>
                  <div>
                    <p className='text-sm text-neutral-500'>Created</p>
                    <p>{new Date(collection.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant='primary'
                  className='w-full'
                  disabled={collection.flashcards.filter(f => f.reviewStatus === ReviewStatus.New).length === 0}
                  onClick={handleStudy}>
                  Study Now
                </Button>
              </CardFooter>
            </Card>

            {previewCard && (
              <div>
                <h2 className='text-xl font-semibold mb-3'>Preview</h2>
                <Flashcard front={previewCard.front} back={previewCard.back} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-md w-full p-6 shadow-lg'>
            <h3 className='text-xl font-semibold mb-4'>Delete Collection</h3>
            <p className='mb-6'>Are you sure you want to delete "{collection.name}"? This action cannot be undone.</p>
            <div className='flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant='primary'
                className='bg-red-500 hover:bg-red-600 text-white'
                onClick={handleDeleteCollection}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div>
      <div className='flex items-center gap-3 mb-6'>
        <div className='h-9 w-9 bg-neutral-200 animate-pulse rounded-full'></div>
        <div className='h-8 w-56 bg-neutral-200 animate-pulse rounded'></div>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2'>
          <div className='flex justify-between items-center mb-4'>
            <div className='h-6 w-36 bg-neutral-200 animate-pulse rounded'></div>
            <div className='h-9 w-32 bg-neutral-200 animate-pulse rounded-lg'></div>
          </div>

          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className='py-4'>
                  <div className='h-6 w-3/4 bg-neutral-200 animate-pulse rounded mb-2'></div>
                  <div className='h-4 w-1/2 bg-neutral-200 animate-pulse rounded'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='md:col-span-1'>
          <Card className='mb-6'>
            <CardHeader>
              <div className='h-6 w-32 bg-neutral-200 animate-pulse rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className='h-4 w-20 bg-neutral-200 animate-pulse rounded mb-1'></div>
                    <div className='h-5 w-24 bg-neutral-200 animate-pulse rounded'></div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className='h-10 w-full bg-neutral-200 animate-pulse rounded-lg'></div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
