import { AlertCircle, ArrowRight, Archive } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollectionStatistics } from '@/api/collections/queries';

export function Statistics() {
  const { data: statistics, isPending } = useCollectionStatistics();

  if (isPending || !statistics) {
    return null;
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
