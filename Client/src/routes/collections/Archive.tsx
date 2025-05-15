import { useCollections } from '@/api/collections/queries';

import { useNavigate } from 'react-router';
import { ArchiveRestore, ArrowLeft, ArrowRight, RotateCcw, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUnarchiveCollection } from '@/api/collections/mutations';
import { TagBadge } from '@/components/ui/tag-badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnarchiveFlashcard } from '@/api/flashcard/mutations';

export default function Archive() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCardsQuery, setSearchCardsQuery] = useState('');
  
  const { data, isLoading } = useCollections({ 
    archived: true,
    searchQuery
  });
  
  const unarchiveCollectionMutation = useUnarchiveCollection({
    onSuccess: () => {
      toast.success('Collection restored successfully');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Failed to restore collection');
    },
  });

  const unarchiveFlashcardMutation = useUnarchiveFlashcard({
    onSuccess: () => {
      toast.success('Flashcard restored successfully');
    },
    onError: () => {
      toast.error('Failed to restore flashcard');
    },
  });

  const handleUnarchive = async (collectionId: string) => {
    unarchiveCollectionMutation.mutate(collectionId);
  };

  const handleUnarchiveFlashcard = async (flashcardId: string) => {
    unarchiveFlashcardMutation.mutate(flashcardId);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-bounce-subtle'>Loading archived collections...</div>
      </div>
    );
  }

  const allArchivedFlashcards = data?.collections.flatMap(collection => 
    collection.archivedFlashcards.map(flashcard => ({
      ...flashcard,
      collectionName: collection.name
    }))
  ) || [];

  const filteredFlashcards = searchCardsQuery
    ? allArchivedFlashcards.filter(
        card =>
          card.front.toLowerCase().includes(searchCardsQuery.toLowerCase()) ||
          card.back.toLowerCase().includes(searchCardsQuery.toLowerCase()) ||
          card.collectionName.toLowerCase().includes(searchCardsQuery.toLowerCase())
      )
    : allArchivedFlashcards;


  if (!data || data.totalCount === 0 && allArchivedFlashcards.length === 0) {
    return (
      <div>
        <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} className='mr-2' /> Back to Dashboard
        </Button>

        <div className='h-[calc(100vh-200px)] flex flex-col items-center justify-center'>
          <RotateCcw className='h-16 w-16 text-neutral-300 mb-4' />
          <h2 className='text-2xl font-semibold mb-2'>No archived collections</h2>
          <p className='text-neutral-600 mb-6 text-center max-w-md'>Collections that you archive will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} className='mr-2' /> Back to Dashboard
      </Button>

      <Tabs defaultValue='collections' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='collections'>Collections</TabsTrigger>
          <TabsTrigger value='flashcards'>Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value='collections'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
            <h1 className='text-3xl font-bold'>Archived Collections</h1>
            <div className='mt-4 sm:mt-0 flex'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='Search archives...'
                  className='pl-9 w-full sm:w-64 bg-white'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {data.collections.length === 0 && searchQuery ? (
            <div className='text-center py-12'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4'>
                <Search className='h-8 w-8 text-muted-foreground' />
              </div>
              <h2 className='text-xl font-medium mb-2'>No collections found</h2>
              <p className='text-muted-foreground'>We couldn't find any archived collections matching your search.</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {data.collections.map(collection => (
                <Card key={collection.id}>
                  <CardHeader>
                    <CardTitle>{collection.name}</CardTitle>
                    <CardDescription>{collection.description}</CardDescription>
                    {/* Display categories and tags */}
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {collection.categories &&
                        collection.categories.length > 0 &&
                        collection.categories.map(category => (
                          <TagBadge key={`category-${category}`} text={category} variant='category' />
                        ))}
                      {collection.tags &&
                        collection.tags.length > 0 &&
                        collection.tags.map(tag => <TagBadge key={`tag-${tag}`} text={tag} variant='tag' />)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-muted-foreground text-sm'>Archived Cards</p>
                        <p className='font-medium'>{collection.archivedFlashcards?.length || 0}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-sm'>Archived Date</p>
                        <p className='font-medium'>
                          {collection.archivedAt ? new Date(collection.archivedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-between'>
                    <Button variant='ghost' size='sm' onClick={() => handleUnarchive(collection.id)}>
                      <ArchiveRestore size={16} className='mr-2' />
                      Unarchive
                    </Button>
                    <Button variant='ghost' size='sm' onClick={() => navigate(`/collections/archive/${collection.id}`)}>
                      View Details
                      <ArrowRight size={16} className='ml-2' />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='flashcards'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
            <h1 className='text-3xl font-bold'>Archived Flashcards</h1>
            <div className='mt-4 sm:mt-0 flex'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='Search flashcards...'
                  className='pl-9 w-full sm:w-64 bg-white'
                  value={searchCardsQuery}
                  onChange={e => setSearchCardsQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            {filteredFlashcards.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-muted-foreground'>
                  {searchCardsQuery ? 'No archived cards match your search.' : 'No archived cards found.'}
                </p>
              </div>
            ) : (
              filteredFlashcards.map(flashcard => (
                <Card key={flashcard.id}>
                  <CardContent className='p-4'>
                    <div className='mb-2'>
                      <h3 className='font-medium'>Question:</h3>
                      <p>{flashcard.front}</p>
                    </div>
                    <div className='mb-3'>
                      <h3 className='font-medium'>Answer:</h3>
                      <p>{flashcard.back}</p>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='text-xs text-muted-foreground'>
                        Collection: {flashcard.collectionName}
                      </div>
                      <Button variant='ghost' size='sm' onClick={() => handleUnarchiveFlashcard(flashcard.id)}>
                        <ArchiveRestore size={16} className='mr-2' />
                        Restore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
