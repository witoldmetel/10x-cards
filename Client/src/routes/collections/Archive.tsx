import { useCollections } from '@/api/collections/queries';

import { useNavigate } from 'react-router';
import { ArchiveRestore, ArrowLeft, ArrowRight, RotateCcw, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUnarchiveCollection } from '@/api/collections/mutations';
import { TagBadge } from '@/components/ui/tag-badge';

export default function Archive() {
  const navigate = useNavigate();
  const { data, isLoading } = useCollections();
  const unarchiveCollectionMutation = useUnarchiveCollection();

  const handleUnarchive = async (collectionId: string) => {
    await unarchiveCollectionMutation.mutateAsync(collectionId);

    navigate('/dashboard');
  };

  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-bounce-subtle'>Loading archived collections...</div>
      </div>
    );
  }

  if (!data || data.totalCount === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <RotateCcw className='h-16 w-16 text-neutral-300 mb-4' />
        <h2 className='text-2xl font-semibold mb-2'>No archived collections</h2>
        <p className='text-neutral-600 mb-6 text-center max-w-md'>Collections that you archive will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} className='mr-2' /> Back to Dashboard
      </Button>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <h1 className='text-3xl font-bold'>Archived Collections</h1>
        <div className='mt-4 sm:mt-0 flex'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search archives...'
              className='pl-9 w-full sm:w-64'
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
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm'>Cards</p>
                    <p className='font-medium'>{collection.archivedFlashcards?.length}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Archived</p>
                    <p className='font-medium'>
                      {collection.createdAt ? new Date(collection.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Mastery</p>
                    <p className='font-medium'>{0}%</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button variant='ghost' size='sm' onClick={() => handleUnarchive(collection.id)}>
                  <ArchiveRestore size={16} className='mr-2' />
                  Unarchive
                </Button>
                <Button variant='ghost' size='sm' onClick={() => navigate(`/collections/${collection.id}`)}>
                  View Details
                  <ArrowRight size={16} className='ml-2' />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
