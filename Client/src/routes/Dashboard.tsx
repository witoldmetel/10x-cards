import { ArrowRight, Plus, Search, Info, Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollections } from '@/api/collections/queries';
import { Link } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { CollectionResponse } from '@/api/collections/types';
import { ReviewStatus } from '@/api/flashcard/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CollectionCard } from '@/components/collections/CollectionCard/CollectionCard';
import { Statistics } from '@/components/collections/Statistics/Statistics';
import { format } from 'date-fns';

export type CollectionCardProps = CollectionResponse & {
  cardCount: number;
  lastStudied: string;
  dueCards: number;
  masteryLevel: number;
};

const ITEMS_PER_PAGE = 9;

export default function Dashboard() {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudyInfo, setShowStudyInfo] = useState(() => {
    return localStorage.getItem('hideStudyInfo') !== 'true';
  });

  const { data, isPending } = useCollections({
    archived: false,
    limit: ITEMS_PER_PAGE,
    ...(searchQuery ? { searchQuery } : {}),
  });

  const collections = useMemo(
    () =>
      data?.collections?.map(collection => ({
        ...collection,
        cardCount: collection.flashcards.length,
        lastStudied: collection.lastStudied ? format(new Date(collection.lastStudied), 'dd.MM.yyyy') : 'Never',
        dueCards: collection.flashcards.filter(
          f => f.collectionId === collection.id && f.reviewStatus === ReviewStatus.New,
        ).length,
        masteryLevel: 0,
      })) as CollectionCardProps[],
    [data?.collections],
  );

  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value.trim());
      }, 1000),
    [],
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchQuery(value);
  };

  const totalDueCards = useMemo(() => {
    return collections?.reduce((acc: number, collection) => acc + collection.dueCards, 0);
  }, [collections]);

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  // @todo: Keep the mock recent activity for now
  const recentActivity = [
    { id: '1', action: 'Studied', collection: 'Biology Fundamentals', date: 'Today', cardsReviewed: 15 },
    { id: '2', action: 'Created', collection: 'Spanish Vocabulary', date: 'Yesterday', cardsCreated: 20 },
    { id: '3', action: 'Generated', collection: 'Advanced Mathematics', date: '3 days ago', cardsGenerated: 30 },
  ];

  const handleHideStudyInfo = () => {
    setShowStudyInfo(false);
    localStorage.setItem('hideStudyInfo', 'true');
  };

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

      {/* Information about study sessions */}
      {showStudyInfo && (
        <div className='mb-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4 relative'>
          <button
            onClick={handleHideStudyInfo}
            className='absolute top-4 right-4 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors'>
            <X size={20} />
          </button>
          <div className='flex items-center gap-2'>
            <Info size={20} className='text-blue-500 dark:text-blue-400' />
            <h2 className='text-2xl font-bold text-blue-700 dark:text-blue-100'>Study Sessions</h2>
            <span className='bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1'>
              <Sparkles size={12} />
              BETA
            </span>
          </div>
          <div className='mt-2 space-y-2 text-blue-700 dark:text-blue-300'>
            <p>Track your learning progress with our new study sessions feature. Here's what's available in beta:</p>
            <ul className='list-disc list-inside ml-2 text-sm'>
              <li>Daily study tracking and statistics</li>
              <li>Progress visualization for each collection</li>
              <li>Spaced repetition learning system</li>
            </ul>
            <p className='text-sm italic'>More features coming soon!</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <Statistics />

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
                value={inputValue}
                onChange={handleSearchInputChange}
                disabled={collections?.length === 0 && !inputValue}
              />
            </div>
          </div>

          {/* Display filtered collections or a message if none found */}
          {isPending ? (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-bounce-subtle'>Loading collections...</div>
            </div>
          ) : collections.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {collections.map(collection => (
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
              <p className='text-sm text-muted-foreground mb-6'>Try a different search term or create a new collection</p>
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
      {totalDueCards > 0 && (
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
                  <p className='text-lg font-medium mb-1'>You have {totalDueCards} cards due for review</p>
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
