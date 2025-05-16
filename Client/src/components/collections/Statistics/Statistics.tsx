import { AlertCircle, ArrowRight, Archive } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollections } from '@/api/collections/queries';
import { CollectionResponse } from '@/api/collections/types';
import { ReviewStatus } from '@/api/flashcard/types';

export function Statistics() {
  const { data, isLoading } = useCollections({
    limit: 100, // Fetch more items for accurate statistics
  });

  if (isLoading || !data?.pages) {
    return null;
  }

  const collections = data.pages.flatMap(page => page.collections);

  const statistics = {
    totalCards: collections.reduce(
      (acc: number, collection: CollectionResponse) =>
        acc + collection.flashcards.length + collection.archivedFlashcards.length,
      0,
    ),
    totalCollections: collections.length,
    dueCards: collections.reduce(
      (acc: number, collection: CollectionResponse) =>
        acc + collection.flashcards.filter(f => f.reviewStatus === ReviewStatus.New).length,
      0,
    ),
    masteredCards: collections.reduce(
      (acc: number, collection: CollectionResponse) =>
        acc + collection.flashcards.filter(f => f.reviewStatus !== ReviewStatus.New).length,
      0,
    ),
    archivedCards: collections.reduce(
      (acc: number, collection: CollectionResponse) => acc + collection.archivedFlashcards.length,
      0,
    ),
    masteryLevel: calculateOverallMastery(collections),
    currentStreak: collections.reduce((acc, collection) => Math.max(acc, collection.currentStreak || 0), 0),
    bestStreak: collections.reduce((acc, collection) => Math.max(acc, collection.bestStreak || 0), 0),
  };

  function calculateOverallMastery(collections: CollectionResponse[]) {
    if (collections.length === 0) return 0;

    const totalMastery = collections.reduce((sum, collection) => sum + (collection.masteryLevel || 0), 0);
    return Math.round(totalMastery / collections.length);
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Cards to Review</CardDescription>
          <CardTitle className='text-3xl'>{statistics.dueCards}</CardTitle>
        </CardHeader>
        <CardFooter>
          <Link
            to='/flashcards/pending-review'
            className='text-sm text-primary hover:underline flex items-center gap-1'>
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
          <p className='text-sm text-muted-foreground'>{statistics.masteredCards} learned</p>
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
                  <p>Average mastery level across all collections</p>
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
                  <p>Days in a row you've studied</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardTitle className='text-3xl'>{statistics.currentStreak} days</CardTitle>
        </CardHeader>
        <CardFooter>
          <p className='text-sm text-muted-foreground'>Best streak: {statistics.bestStreak} days</p>
        </CardFooter>
      </Card>
    </div>
  );
}
