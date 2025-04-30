import { BookOpen, Clock, RotateCcw } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Card } from './ui/card';
import { cn } from '@/lib/tailwind';
import { Button } from './ui/button';
import type { CollectionResponseDto } from '@/api/collections/types';
import { useUnarchiveCollection } from '@/api/collections/mutations';
import { useNavigate } from 'react-router';

interface CollectionCardProps {
  collection: CollectionResponseDto;
  onStudy: () => void;
  onView: () => void;
  className?: string;
}

export default function CollectionCard({ collection, onStudy, onView, className }: CollectionCardProps) {
  const navigate = useNavigate();
  const unarchiveCollectionMutation = useUnarchiveCollection();

  const { name, description, totalCards, dueCards, color, archivedAt } = collection;




  const isArchived = archivedAt !== null && collection?.archivedFlashcards?.length > 0;

  const handleUnarchive = async (collectionId: string) => {
    await unarchiveCollectionMutation.mutateAsync(collectionId);
    navigate('/dashboard');
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div className='flex-1'>
            <CardTitle className='truncate'>{name}</CardTitle>
            <CardDescription className='mt-1 line-clamp-2'>{description}</CardDescription>
          </div>
          <div
            className='h-10 w-10 rounded-full flex items-center justify-center'
            style={{ backgroundColor: color || '#3B82F6' }}>
            <BookOpen className='h-5 w-5 text-white' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex-1'>
        <div className='flex justify-between text-sm text-neutral-600 mt-2'>
          <div className='flex items-center'>
            <BookOpen className='h-4 w-4 mr-1' />
            <span>{isArchived ? collection?.archivedFlashcards?.length : collection?.flashcards?.length} cards</span>
          </div>
          <div className='flex items-center'>
            <Clock className='h-4 w-4 mr-1' />
            <span>{dueCards} due</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between gap-3'>
        <Button variant='outline' onClick={onView} className='flex-1'>
          View
        </Button>

        {isArchived ? (
          <Button
            variant='primary'
            onClick={() => handleUnarchive(collection.id)}
            className='flex-1'
            disabled={totalCards === 0}>
            <div className='flex items-center gap-2'>
              <RotateCcw className='h-4 w-4' />
              <span>Unarchive</span>
            </div>
          </Button>
        ) : (
          // @todo: temporarily disabled
          <Button variant='primary' onClick={onStudy} className='flex-1' disabled={true}>
            Study
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
