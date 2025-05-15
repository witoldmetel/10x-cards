import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArchiveRestore, ArrowLeft, Search } from 'lucide-react';

import { useCollection } from '@/api/collections/queries';
import { useUnarchiveCollection } from '@/api/collections/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TagBadge } from '@/components/ui/tag-badge';
import { toast } from 'sonner';
import { CollectionIcon } from '@/components/collections/CollectionIcon/CollectionIcon';

export default function ArchivedCollectionDetails() {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollection(collectionId || '');

  const unarchiveCollectionMutation = useUnarchiveCollection({
    onSuccess: () => {
      toast.success('Collection restored successfully');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Failed to restore collection');
    },
  });

  const handleUnarchive = async () => {
    if (!collectionId) return;
    unarchiveCollectionMutation.mutate(collectionId);
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
        <Button variant='ghost' size='sm' onClick={() => navigate('/collections/archive')}>
          Back to Archive
        </Button>
      </div>
    );
  }

  const filteredFlashcards = searchQuery
    ? collection.archivedFlashcards.filter(
        card =>
          card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.back.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : collection.archivedFlashcards;

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/collections/archive')}>
        <ArrowLeft size={16} className='mr-2' /> Back to Archive
      </Button>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <CollectionIcon color={collection.color} size='lg' />
          <div>
            <h1 className='text-3xl font-bold'>{collection.name}</h1>
            <p className='text-muted-foreground'>{collection.description}</p>
          </div>
        </div>
        <div className='flex items-center gap-2 mt-4 sm:mt-0'>
          <Button variant='default' size='sm' className='gap-1' onClick={handleUnarchive}>
            <ArchiveRestore size={16} /> Restore Collection
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
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Archived Cards</p>
              <p className='text-2xl font-medium'>{collection.archivedFlashcards.length}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Archive Date</p>
              <p className='text-2xl font-medium'>
                {collection.archivedAt ? new Date(collection.archivedAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className='relative mb-6'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          placeholder='Search archived cards...'
          className='pl-9 bg-white'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Archived Flashcards */}
      <div className='space-y-4'>
        {filteredFlashcards.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>
              {searchQuery ? 'No archived cards match your search.' : 'No archived cards in this collection.'}
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
                <div>
                  <h3 className='font-medium'>Answer:</h3>
                  <p>{flashcard.back}</p>
                </div>
                <div className='mt-3 text-xs inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded'>
                  Archived on {new Date(flashcard.archivedAt!).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
