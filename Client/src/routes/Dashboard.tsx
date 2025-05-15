import { AlertCircle, ArrowRight, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollections } from '@/api/collections/queries';
import { Link } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { CollectionResponse } from '@/api/collections/types';
import { ReviewStatus } from '@/api/flashcard/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CollectionCard } from '@/components/collections/CollectionCard/CollectionCard';

export type CollectionCardProps = CollectionResponse & {
  cardCount: number;
  lastStudied: string;
  dueCards: number;
  masteryLevel: number;
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useCollections({ 
    archived: false,
    searchQuery 
  });

  const collections = data?.collections.map(collection => ({
    ...collection,
    cardCount: collection.flashcards.length,
    lastStudied: 'Never',
    dueCards: collection.flashcards.filter(f => f.collectionId === collection.id && f.reviewStatus === ReviewStatus.New)
      .length,
    masteryLevel: 0,
  })) as CollectionCardProps[];

  // function timeAgo(date: Date) {
  //   const now = new Date();
  //   const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

  //   if (diffInDays === 0) return 'Today';
  //   if (diffInDays === 1) return 'Yesterday';
  //   if (diffInDays < 7) return `${diffInDays} days ago`;
  //   return new Date(date).toLocaleDateString();
  // }

  // Calculate statistics from real data
  const statistics = {
    totalCards: data?.collections.reduce((acc, collection) => acc + collection.flashcards.length, 0) || 0,
    totalCollections: data?.collections.length || 0,
    cardsToReview:
      data?.collections.reduce(
        (acc, collection) => acc + collection.flashcards.filter(f => f.reviewStatus === ReviewStatus.New).length,
        0,
      ) || 0,
    cardsLearned:
      data?.collections.reduce(
        (acc, collection) => acc + collection.flashcards.filter(f => f.reviewStatus !== ReviewStatus.New).length,
        0,
      ) || 0,
    masteryLevel: calculateOverallMastery(data?.collections || []),
    streak: 0, // This would require a proper streak tracking system
  };

  function calculateOverallMastery(collections: CollectionResponse[]) {
    if (collections.length === 0) return 0;

    // @todo: Implement mastery calculation
    // const totalMastery = collections.reduce((sum, collection) => sum + (collection.masteryPercentage || 0), 0);
    const totalMastery = 0;

    return Math.round(totalMastery / collections.length);
  }

  // Keep the mock recent activity for now
  const recentActivity = [
    { id: '1', action: 'Studied', collection: 'Biology Fundamentals', date: 'Today', cardsReviewed: 15 },
    { id: '2', action: 'Created', collection: 'Spanish Vocabulary', date: 'Yesterday', cardsCreated: 20 },
    { id: '3', action: 'Generated', collection: 'Advanced Mathematics', date: '3 days ago', cardsGenerated: 30 },
  ];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-bounce-subtle'>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <div className='flex mt-4 sm:mt-0 gap-3'>
          <Link to='/flashcards/create'>
            <Button variant='outline' className='flex items-center gap-2'>
              <Plus size={18} /> Create Flashcards
            </Button>
          </Link>
          <Link to='/flashcards/generate'>
            <Button className='flex items-center gap-2'>
              <Plus size={18} /> AI Generate
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Cards to Review</CardDescription>
            <CardTitle className='text-3xl'>{statistics.cardsToReview}</CardTitle>
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
            <p className='text-sm text-muted-foreground'>{statistics.cardsLearned} learned</p>
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

      <Tabs defaultValue='collections'>
        <TabsList className='mb-6'>
          <TabsTrigger value='collections'>Collections</TabsTrigger>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className='inline-flex'>
                  <TabsTrigger value='activity' disabled>
                    Recent Activity
                  </TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>This feature is coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>

        <TabsContent value='collections'>
          {/* Search input */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search collections...'
                className='pl-9 bg-white'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={collections?.length === 0 && !searchQuery}
              />
            </div>
          </div>

          {/* Display filtered collections or a message if none found */}
          {collections && collections?.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {collections?.map(collection => (
                <div key={collection.id}>
                  <CollectionCard {...collection} />
                </div>
              ))}
              <Link to='/flashcards/options' className='block'>
                <Card className='border-dashed h-full border-2 hover:border-primary hover:shadow-md transition-all'>
                  <CardContent className='flex flex-col items-center justify-center h-full py-12'>
                    <div className='rounded-full bg-primary/10 p-3 mb-4'>
                      <Plus size={24} className='text-primary' />
                    </div>
                    <p className='font-medium text-center'>Create a new collection</p>
                    <p className='text-sm text-muted-foreground text-center mt-1'>
                      Add flashcards manually or generate them with AI
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4'>
                <Search className='h-6 w-6 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-medium mb-2'>No collections found</h3>
              <p className='text-sm text-muted-foreground mb-6'>
                Try a different search term or create a new collection
              </p>
              <div className='flex justify-center'>
                <Link to='/flashcards/create'>
                  <Button className='flex items-center gap-2'>
                    <Plus size={18} /> Create New Collection
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='activity'>
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Your recent learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentActivity?.map(activity => (
                  <div key={activity.id} className='flex items-start gap-4 pb-4 border-b last:border-0'>
                    <div className='rounded-full bg-primary/10 p-2 mt-1'>
                      {activity.action === 'Studied' ? (
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M12 6V12L16 14'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
                        </svg>
                      ) : activity.action === 'Created' ? (
                        <Plus size={16} />
                      ) : (
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path d='M21 3L3 21' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                          <path d='M21 21L3 3' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                        </svg>
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center'>
                        <p className='font-medium'>
                          {activity.action} {activity.collection}
                        </p>
                        <span className='text-sm text-muted-foreground'>{activity.date}</span>
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {activity.cardsReviewed && `Reviewed ${activity.cardsReviewed} cards`}
                        {activity.cardsCreated && `Created ${activity.cardsCreated} cards`}
                        {activity.cardsGenerated && `Generated ${activity.cardsGenerated} cards`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cards Pending Review Section */}
      {statistics.cardsToReview > 0 && (
        <div className='mt-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold'>Cards Pending Review</h2>
            <Link to='/flashcards/pending-review'>
              <Button variant='ghost' className='flex items-center gap-1 text-primary'>
                See all <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className='p-6'>
              <div className='flex flex-col sm:flex-row justify-between items-center'>
                <div>
                  <p className='text-lg font-medium mb-1'>You have {statistics.cardsToReview} cards due for review</p>
                  <p className='text-muted-foreground'>Keeping up with reviews improves long-term memory retention</p>
                </div>
                <Link to='/flashcards/pending-review' className='mt-4 sm:mt-0'>
                  <Button>
                    Start Reviewing <ArrowRight size={16} className='ml-1' />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
