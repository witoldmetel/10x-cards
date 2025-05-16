import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Plus, Edit, ArrowLeft, BookOpen, Archive, Eye, Trash2 } from 'lucide-react';

import { useCollection } from '@/api/collections/queries';
import { useDeleteCollection, useArchiveCollection } from '@/api/collections/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewStatus } from '@/api/flashcard/types';
import { FlashcardView } from '@/components/flashcards/FlashcardView/FlashcardView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagBadge } from '@/components/ui/tag-badge';
import { Progress } from '@/components/ui/progress';

import { toast } from 'sonner';
import { FlashcardActions } from '@/components/flashcards/FlashcardActions/FlashcardActions';
import { CollectionIcon } from '@/components/collections/CollectionIcon/CollectionIcon';
import { EditCollectionDialog } from '@/components/collections/EditCollectionDialog/EditCollectionDialog';
import { useSubmitStudySession } from '@/api/flashcard/mutations';
import { format } from 'date-fns';

export default function CollectionDetails() {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();

  const {
    data: collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollection(collectionId || '');

  const deleteCollectionMutation = useDeleteCollection();
  const archiveCollectionMutation = useArchiveCollection();
  const submitStudySession = useSubmitStudySession();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [sessionResults, setSessionResults] = useState<
    Array<{ flashcardId: string; grade: number; studiedAt: string }>
  >([]);

  const collectionFlashcards =
    collection?.flashcards.filter(
      collection => collection.reviewStatus === ReviewStatus.Approved && !collection.archivedAt,
    ) || [];
  const pendingReviewCount =
    collection?.flashcards.filter(
      collection => collection.reviewStatus === ReviewStatus.ToCorrect && !collection.archivedAt,
    )?.length || 0;

  const startStudySession = () => {
    setIsStudying(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyStats({
      correct: 0,
      incorrect: 0,
      total: collectionFlashcards?.length || 0,
    });
    toast.success('Study session started');
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleArchiveCollection = async () => {
    if (!collectionId) return;
    try {
      await archiveCollectionMutation.mutateAsync(collectionId);
      toast.success('Collection archived successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to archive collection');
    }
  };

  const handleDeleteCollection = async () => {
    if (!collectionId) return;

    setIsDeleteModalOpen(false);

    navigate('/dashboard');

    try {
      await deleteCollectionMutation.mutateAsync(collectionId);
      toast.success('Collection deleted successfully');
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  const handleGradeCard = (grade: number) => {
    const currentFlashcard = collectionFlashcards[currentCardIndex];

    // Create new result for current card
    const newResult = {
      flashcardId: currentFlashcard.id,
      grade,
      studiedAt: new Date().toISOString(),
    };

    // Update study stats
    const newStats = { ...studyStats };
    if (grade >= 3) {
      newStats.correct = studyStats.correct + 1;
      toast.success('Card marked as correct');
    } else {
      newStats.incorrect = studyStats.incorrect + 1;
      toast.error('Card marked as incorrect');
    }

    setStudyStats(newStats);

    // Add result to session results
    const updatedSessionResults = [...sessionResults, newResult];
    setSessionResults(updatedSessionResults);

    if (currentCardIndex < collectionFlashcards.length - 1) {
      // Move to next card
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      toast.info('Next card loaded');
    } else {
      // End of study session
      // Submit session results with the updated array that includes the last card
      submitStudySession.mutate({
        collectionId: collectionId!,
        results: updatedSessionResults,
      });

      // Show completion screen
      setIsStudying(false);
      setShowAnswer(false);
      setCurrentCardIndex(0);
      setSessionResults([]);

      // Show success message with detailed stats using the updated newStats
      toast.success(
        `Study session completed! You got ${newStats.correct} out of ${newStats.total} cards correct (${Math.round((newStats.correct / newStats.total) * 100)}% accuracy)`,
      );
    }
  };

  const handleEditCollection = () => {
    setEditDialogOpen(true);
  };

  const handleAddCards = () => {
    navigate(`/flashcards/create?collectionId=${collectionId}`);
    toast.info('Redirecting to manual card creation');
  };

  if (isCollectionLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-bounce-subtle'>Loading collection...</div>
      </div>
    );
  }

  if (isCollectionError || !collection) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-2xl font-semibold mb-4'>Collection not found</h2>
        <Button variant='ghost' size='sm' onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate(-1)}>
        <ArrowLeft size={16} className='mr-2' /> Go Back
      </Button>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <CollectionIcon color={collection.color} size='lg' />
          <div>
            <h1 className='text-3xl font-bold'>{collection.name}</h1>
            <p className='text-muted-foreground'>{collection.description}</p>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2 mt-4 sm:mt-0'>
          <Button variant='outline' size='sm' className='gap-1' onClick={handleEditCollection}>
            <Edit size={16} /> Edit
          </Button>
          <Button variant='outline' size='sm' className='gap-1' onClick={handleArchiveCollection}>
            <Archive size={16} /> Archive
          </Button>
          <Button variant='destructive' size='sm' className='gap-1' onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 size={16} /> Delete
          </Button>
          <Button variant='outline' size='sm' className='gap-1' onClick={handleAddCards}>
            <Plus size={16} /> Add Cards
          </Button>
        </div>
      </div>

      {/* Display tags and categories */}
      {((collection.categories && collection.categories.length > 0) ||
        (collection.tags && collection.tags.length > 0)) && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {collection.categories &&
            collection.categories.map(category => (
              <TagBadge key={`category-${category}`} text={category} variant='category' />
            ))}
          {collection.tags && collection.tags.map(tag => <TagBadge key={`tag-${tag}`} text={tag} variant='tag' />)}
        </div>
      )}

      {/* Statistics Card */}
      <Card className='mb-8'>
        <CardContent className='p-6'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Total Cards</p>
              <p className='text-2xl font-medium'>{collectionFlashcards?.length}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Pending Review</p>
              <p className='text-2xl font-medium'>{pendingReviewCount}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Last Studied</p>
              <p className='text-2xl font-medium'>
                {collection.lastStudied ? format(new Date(collection.lastStudied), 'dd.MM.yyyy') : 'Never'}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Mastery Level</p>
              <div className='flex items-center gap-2'>
                <p className='text-2xl font-medium mr-2'>{collection.masteryLevel?.toFixed(2)}%</p>
                <Progress value={collection.masteryLevel} className='h-2 w-24' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      {!isStudying && collectionFlashcards && collectionFlashcards.length > 0 && (
        <div className='flex flex-col sm:flex-row gap-4 mb-8'>
          <Button className='flex-1 flex items-center justify-center gap-2' onClick={startStudySession}>
            <BookOpen size={18} /> Start Study Session
          </Button>

          <Button
            variant='secondary'
            className='flex-1 flex items-center justify-center gap-2'
            disabled={pendingReviewCount === 0}
            onClick={() => navigate(`/flashcards/pending-review?collectionId=${collectionId}`)}>
            <Eye size={18} /> Review AI Cards {pendingReviewCount > 0 && `(${pendingReviewCount})`}
          </Button>
        </div>
      )}

      {/* Study session, review notification, or empty state */}
      {isStudying && collectionFlashcards && collectionFlashcards.length > 0 ? (
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold'>Study Session</h2>
            <div className='text-sm text-muted-foreground'>
              Card {currentCardIndex + 1} of {collectionFlashcards.length}
            </div>
          </div>

          <FlashcardView
            flashcard={collectionFlashcards[currentCardIndex]}
            showAnswer={showAnswer}
            onShowAnswer={handleShowAnswer}
            onGrade={handleGradeCard}
          />
        </div>
      ) : pendingReviewCount > 0 ? (
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold'>Cards Need Review</h2>
          </div>

          <Card className='bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-100'>
            <CardContent className='flex flex-col items-center p-6 sm:p-8'>
              <div className='mb-4 text-amber-700 dark:text-amber-300'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='48'
                  height='48'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-alert-triangle'>
                  <path d='M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                  <path d='M12 9v4' />
                  <path d='M12 17h.01' />
                </svg>
              </div>
              <h3 className='text-2xl font-bold mb-2'>Review Needed First</h3>
              <p className='text-center mb-6'>
                This collection has {pendingReviewCount} AI-generated cards that need review before studying.
              </p>
              <Button
                variant='secondary'
                size='lg'
                onClick={() => navigate(`/flashcards/pending-review?collectionId=${collectionId}`)}
                className='w-full max-w-xs'>
                Review AI Cards
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : collectionFlashcards && collectionFlashcards.length > 0 ? (
        <div></div> // This is empty because we moved the study button to the action buttons section above
      ) : (
        <Card className='mb-8'>
          <CardContent className='p-6 flex flex-col items-center'>
            <p className='text-center mb-4'>This collection doesn't have any cards yet.</p>
            <Button onClick={handleAddCards}>
              <Plus size={16} className='mr-2' /> Add Cards
            </Button>
          </CardContent>
        </Card>
      )}

      {!isStudying && (
        <Tabs defaultValue='all'>
          <TabsList className='mb-6'>
            <TabsTrigger value='all'>All Cards</TabsTrigger>
            <TabsTrigger value='pending' disabled={pendingReviewCount === 0}>
              Pending Review ({pendingReviewCount})
            </TabsTrigger>
            {collection.flashcards.filter(card => card.reviewStatus === ReviewStatus.Rejected && !card.archivedAt)
              .length > 0 && (
              <TabsTrigger value='rejected'>
                Rejected (
                {
                  collection.flashcards.filter(card => card.reviewStatus === ReviewStatus.Rejected && !card.archivedAt)
                    .length
                }
                )
              </TabsTrigger>
            )}
            {collection.archivedFlashcards.length > 0 && (
              <TabsTrigger value='archived'>Archived ({collection.archivedFlashcards.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='all'>
            <div className='space-y-4'>
              {collectionFlashcards.length > 0 ? (
                collection.flashcards
                  .filter(flashcard => flashcard.reviewStatus === ReviewStatus.Approved && !flashcard.archivedAt)
                  .map(flashcard => (
                    <Card key={flashcard.id}>
                      <CardContent className='p-4'>
                        <div className='mb-2'>
                          <h3 className='font-medium'>Question:</h3>
                          <p>{flashcard.front}</p>
                        </div>
                        <div>
                          <h3 className='font-medium'>Answer:</h3>
                          <p>{flashcard.back}</p>
                        </div>
                        <FlashcardActions flashcard={flashcard} />
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <p className='text-muted-foreground text-center py-4'>No cards in this collection yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value='pending'>
            <div className='space-y-4'>
              {collection?.flashcards
                .filter(collection => collection.reviewStatus === ReviewStatus.ToCorrect && !collection.archivedAt)
                .map(flashcard => (
                  <Card key={flashcard.id}>
                    <CardContent className='p-4'>
                      <div className='mb-2'>
                        <h3 className='font-medium'>Question:</h3>
                        <p>{flashcard.front}</p>
                      </div>
                      <div>
                        <h3 className='font-medium'>Answer:</h3>
                        <p>{flashcard.back}</p>
                      </div>
                      <div className='mt-3 text-xs inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded'>
                        Needs correction
                      </div>
                      <FlashcardActions flashcard={flashcard} />
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='rejected'>
            <div className='space-y-4'>
              {collection.flashcards
                .filter(card => card.reviewStatus === ReviewStatus.Rejected && !card.archivedAt)
                .map(flashcard => (
                  <Card key={flashcard.id}>
                    <CardContent className='p-4'>
                      <div className='mb-2'>
                        <h3 className='font-medium'>Question:</h3>
                        <p>{flashcard.front}</p>
                      </div>
                      <div>
                        <h3 className='font-medium'>Answer:</h3>
                        <p>{flashcard.back}</p>
                      </div>
                      <div className='mt-3 text-xs inline-block px-2 py-1 bg-destructive text-destructive-foreground rounded'>
                        Rejected
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='archived'>
            <div className='space-y-4'>
              {collection.archivedFlashcards.map(flashcard => (
                <Card key={flashcard.id}>
                  <CardContent className='p-4'>
                    <div className='mb-2'>
                      <h3 className='font-medium'>Question:</h3>
                      <p>{flashcard.front}</p>
                    </div>
                    <div>
                      <h3 className='font-medium'>Answer:</h3>
                      <p>{flashcard.back}</p>
                    </div>
                    <div className='mt-3 text-xs inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded'>
                      Archived
                    </div>
                    <FlashcardActions flashcard={flashcard} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Collection Edit Dialog */}
      {collection && (
        <EditCollectionDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} collection={collection} />
      )}

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
                variant='destructive'
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
