import { AlertCircle, ArrowRight, Archive } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CollectionResponse } from '@/api/collections/types';
import { ReviewStatus } from '@/api/flashcard/types';
import { useCollections } from '@/api/collections/queries';

export function Statistics() {
  const { data, isLoading } = useCollections();

  if (isLoading || !data?.collections) {
    return null;
  }

  const collections = data.collections;

  const statistics = {
    totalCards: collections.reduce((acc: number, collection: CollectionResponse) => 
      acc + collection.flashcards.length + collection.archivedFlashcards.length, 0),
    totalCollections: collections.length,
    cardsToReview: collections.reduce((acc: number, collection: CollectionResponse) => 
      acc + collection.flashcards.filter(f => f.reviewStatus === ReviewStatus.New).length, 0),
    cardsLearned: collections.reduce((acc: number, collection: CollectionResponse) => 
      acc + collection.flashcards.filter(f => f.reviewStatus !== ReviewStatus.New).length, 0),
    archivedCards: collections.reduce((acc: number, collection: CollectionResponse) => 
      acc + collection.archivedFlashcards.length, 0),
    masteryLevel: calculateOverallMastery(collections),
    streak: 0,
  };

  function calculateOverallMastery(collections: CollectionResponse[]) {
    if (collections.length === 0) return 0;

    // @todo: Implement mastery calculation
    // const totalMastery = collections.reduce((sum, collection) => sum + (collection.masteryPercentage || 0), 0);
    const totalMastery = 0;

    return Math.round(totalMastery / collections.length);
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Cards to Review</CardDescription>
          <CardTitle className='text-3xl'>{statistics.cardsToReview}</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link to='/flashcards/pending-review' className='text-sm text-primary hover:underline flex items-center gap-1'>
            Review now <ArrowRight size={14} />
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Total Flashcards</CardDescription>
          <CardTitle className='text-3xl'>{statistics.totalCards}</CardTitle>
        </CardHeader>
        <CardFooter>
          <p className='text-sm text-muted-foreground'>{statistics.cardsLearned} learned</p>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Archived Cards</CardDescription>
          <CardTitle className='text-3xl'>{statistics.archivedCards}</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link to='/collections/archive' className='text-sm text-primary hover:underline flex items-center gap-1'>
            View archive <Archive size={14} />
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2'>
            <CardDescription>Mastery Level</CardDescription>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle size={14} className='text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This feature is in progress</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardTitle className='text-3xl'>{statistics.masteryLevel}%</CardTitle>
        </CardHeader>
        <CardFooter>
          <div className='w-full bg-muted rounded-full h-2 mt-2'>
            <div className='bg-primary rounded-full h-2' style={{ width: `${statistics.masteryLevel}%` }}></div>
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2'>
            <CardDescription>Current Streak</CardDescription>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle size={14} className='text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This feature is in progress</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardTitle className='text-3xl'>{statistics.streak} days</CardTitle>
        </CardHeader>
        <CardFooter>
          <p className='text-sm text-muted-foreground'>Keep it going!</p>
        </CardFooter>
      </Card>
    </div>
  );
} 