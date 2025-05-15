import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, X, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useCollection, useCollections } from '@/api/collections/queries';
import { FlashcardCreationSource, ReviewStatus } from '@/api/flashcard/types';
import { useUpdateFlashcard } from '@/api/flashcard/mutations';
import { Textarea } from '@/components/ui/textarea';

export default function PendingReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get('collectionId');

  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewingCollection, setReviewingCollection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({
    front: '',
    back: '',
  });

  const { data: collections } = useCollections({ archived: false });
  const { data: collection } = useCollection(collectionId || '');
  const updateFlashcardMutation = useUpdateFlashcard();

  // Group flashcards by collection
  const [pendingByCollection, setPendingByCollection] = useState<Record<string, any>>({});
  const [totalPendingCards, setTotalPendingCards] = useState(0);

  useEffect(() => {
    // Group flashcards by collection and count them
    const groupedByCollection: Record<string, any> = {};
    let total = 0;

    collection?.flashcards
      .filter(
        card => card.creationSource === FlashcardCreationSource.AI && card.reviewStatus === ReviewStatus.ToCorrect,
      )
      .forEach(card => {
        if (!groupedByCollection[card.collectionId]) {
          const collection = collections?.collections.find(c => c.id === card.collectionId);
          groupedByCollection[card.collectionId] = {
            collectionId: card.collectionId,
            collectionName: collection?.name || 'Unknown Collection',
            cards: [],
            count: 0,
            lastStudied: 'Never',
            masteryPercentage: 0,
          };
        }

        groupedByCollection[card.collectionId].cards.push(card);
        groupedByCollection[card.collectionId].count += 1;
        total += 1;
      });

    setPendingByCollection(groupedByCollection);
    setTotalPendingCards(total);
    setIsLoading(false);

    // If collection ID was specified in URL, start reviewing that collection
    if (collectionId && groupedByCollection[collectionId]) {
      setReviewingCollection(collectionId);
      setCurrentCardIndex(0);
    }
  }, [collection?.flashcards, collections, collectionId]);

  const startReviewing = (collectionId: string) => {
    setReviewingCollection(collectionId);
    setCurrentCardIndex(0);
  };

  const handleApprove = async () => {
    if (!reviewingCollection) return;

    const currentCard = pendingByCollection[reviewingCollection].cards[currentCardIndex];

    try {
      await updateFlashcardMutation.mutateAsync({
        id: currentCard.id,
        flashcard: {
          reviewStatus: ReviewStatus.Approved,
        },
      });

      toast.success('Card approved and added to learning');
      moveToNextCard();
    } catch (error) {
      toast.error('Failed to approve card');
    }
  };

  const handleReject = async () => {
    if (!reviewingCollection) return;

    const currentCard = pendingByCollection[reviewingCollection].cards[currentCardIndex];

    try {
      await updateFlashcardMutation.mutateAsync({
        id: currentCard.id,
        flashcard: {
          reviewStatus: ReviewStatus.Rejected,
        },
      });

      toast.error('Card rejected');
      moveToNextCard();
    } catch (error) {
      toast.error('Failed to reject card');
    }
  };

  const moveToNextCard = () => {
    if (!reviewingCollection) return;

    const collectionCards = pendingByCollection[reviewingCollection].cards;

    if (currentCardIndex < collectionCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // End of review for this collection
      setReviewingCollection(null);

      // Refresh the data
      setPendingByCollection(prev => {
        const updated = { ...prev };
        delete updated[reviewingCollection];
        return updated;
      });

      toast.success('Finished reviewing this collection!');
    }
  };

  const handleEdit = () => {
    if (!reviewingCollection) return;

    const currentCard = pendingByCollection[reviewingCollection].cards[currentCardIndex];
    setEditedValues({
      front: currentCard.front,
      back: currentCard.back,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!reviewingCollection) return;

    const currentCard = pendingByCollection[reviewingCollection].cards[currentCardIndex];

    try {
      await updateFlashcardMutation.mutateAsync({
        id: currentCard.id,
        flashcard: {
          front: editedValues.front,
          back: editedValues.back,
        },
      });

      // Update the card in local state to reflect changes
      setPendingByCollection(prev => ({
        ...prev,
        [reviewingCollection]: {
          ...prev[reviewingCollection],
          cards: prev[reviewingCollection].cards.map((card: typeof currentCard) =>
            card.id === currentCard.id ? { ...card, front: editedValues.front, back: editedValues.back } : card,
          ),
        },
      }));

      setIsEditing(false);
      toast.success('Card updated successfully');
    } catch (error) {
      toast.error('Failed to update card');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValues({
      front: '',
      back: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedValues(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-bounce-subtle'>Loading pending reviews...</div>
      </div>
    );
  }

  // If we're reviewing a specific collection
  if (reviewingCollection && pendingByCollection[reviewingCollection]) {
    const collection = pendingByCollection[reviewingCollection];
    const currentCard = collection.cards[currentCardIndex];

    return (
      <div>
        <Button variant='ghost' size='sm' className='mb-6' onClick={() => setReviewingCollection(null)}>
          <ArrowLeft size={16} className='mr-2' /> Back to Pending Reviews
        </Button>

        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>Reviewing {collection.collectionName}</h1>
          <p className='text-muted-foreground'>
            Card {currentCardIndex + 1} of {collection.cards.length}
          </p>
        </div>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                name='front'
                value={editedValues.front}
                onChange={handleChange}
                placeholder='Enter question...'
                className='min-h-[100px]'
              />
            ) : (
              <p className='text-lg'>{currentCard.front}</p>
            )}
          </CardContent>
        </Card>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                name='back'
                value={editedValues.back}
                onChange={handleChange}
                placeholder='Enter answer...'
                className='min-h-[100px]'
              />
            ) : (
              <p className='text-lg'>{currentCard.back}</p>
            )}
          </CardContent>
        </Card>

        <div className='flex justify-between'>
          {isEditing ? (
            <>
              <Button variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className='flex items-center gap-2'>
                <Save size={16} /> Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='outline'
                className='flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
                onClick={handleReject}>
                <X size={16} /> Reject Card
              </Button>
              <div className='flex gap-2'>
                <Button variant='outline' className='flex items-center gap-2' onClick={handleEdit}>
                  <Edit2 size={16} /> Edit Card
                </Button>
                <Button className='flex items-center gap-2' onClick={handleApprove}>
                  <Check size={16} /> Approve Card
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant='ghost'
        size='sm'
        className='mb-6'
        onClick={() => {
          if (collectionId) {
            navigate(`/collections/${collectionId}`);
          } else {
            navigate('/dashboard');
          }
        }}>
        <ArrowLeft size={16} className='mr-2' />
        {collectionId ? 'Back to Collection' : 'Back to Dashboard'}
      </Button>

      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Cards Pending Review</h1>
        <p className='text-muted-foreground'>
          {totalPendingCards > 0
            ? `You have ${totalPendingCards} AI-generated cards that need correction.`
            : "You don't have any AI-generated cards that need correction."}
        </p>
      </div>

      {totalPendingCards > 0 ? (
        <>
          {/* Summary Card */}
          <Card className='bg-primary text-primary-foreground mb-8'>
            <CardContent className='flex flex-col sm:flex-row justify-between items-center p-6'>
              <div>
                <h2 className='text-2xl font-bold mb-2'>Review AI-Generated Cards</h2>
                <p className='opacity-90 max-w-md'>
                  Some AI-generated cards need correction. Review and improve these cards before adding them to your
                  learning queue.
                </p>
              </div>
              <Button
                variant='secondary'
                size='lg'
                className='mt-4 sm:mt-0'
                onClick={() => {
                  const firstCollectionId = Object.keys(pendingByCollection)[0];
                  startReviewing(firstCollectionId);
                }}>
                Start Reviewing <ArrowRight size={16} className='ml-2' />
              </Button>
            </CardContent>
          </Card>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Object.values(pendingByCollection).map(collection => (
              <Card key={collection.collectionId}>
                <CardHeader>
                  <CardTitle>{collection.collectionName}</CardTitle>
                  <CardDescription>AI-Generated Cards Needing Correction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <span className='text-3xl font-bold'>{collection.count}</span>
                    <p className='text-muted-foreground'>Cards to correct</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant='outline'
                    className='w-full justify-between'
                    onClick={() => startReviewing(collection.collectionId)}>
                    <span>Review Cards</span>
                    <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className='p-6 text-center'>
            <div className='mb-4 text-muted-foreground'>
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
                className='mx-auto mb-2'>
                <path d='M16 16h.01'></path>
                <path d='M8 16h.01'></path>
                <path d='M12 20v-4'></path>
                <path d='M12 12a8 8 0 1 0 0 16 8 8 0 1 0 0-16z'></path>
              </svg>
              <h3 className='text-xl font-medium mt-2'>No Cards to Review</h3>
            </div>
            <p className='mb-6'>You don't have any AI-generated cards that need correction.</p>
            <Button onClick={() => navigate('/flashcards/generate')}>Generate New AI Cards</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
