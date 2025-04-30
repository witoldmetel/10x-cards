import { Brain, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CollectionCard from '@/components/CollectionCard';
import { useCollections } from '@/api/collections/queries';
import { useNavigate } from 'react-router';

type EmptyStateProps = {
  onCreateCollection: () => void;
  onGenerateWithAI: () => void;
};

export default function Dashboard() {
  const { data, isLoading } = useCollections();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div>
      {data && data.length !== 0 &&<div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>My Flashcard collections</h1>
        <div className='flex gap-3'>
          <Button
            variant='outline'
            leftIcon={<Brain className='h-4 w-4' />}
            onClick={() => navigate('/generate/ai')}
          >
            Generate with AI
          </Button>
          <Button
            variant='primary'
            leftIcon={<Plus className='h-4 w-4' />}
            onClick={() => navigate('/generate/manual')}
          >
            Create Collection
          </Button>
        </div>
      </div>}

      {(!data || data.length === 0) ? (
        <EmptyState onCreateCollection={() => navigate('/generate/manual')} onGenerateWithAI={() => navigate('/generate/ai')} />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {data.map(collection => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onStudy={() => console.log(collection.id)}
              onView={() => navigate(`/collections/${collection.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded"></div>
        <div className="h-10 w-32 bg-neutral-200 animate-pulse rounded-lg"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-64">
            <CardHeader>
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-neutral-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-full bg-neutral-200 animate-pulse rounded"></div>
                </div>
                <div className="h-10 w-10 bg-neutral-200 animate-pulse rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-neutral-200 animate-pulse rounded mt-4"></div>
              <div className="h-4 w-3/4 bg-neutral-200 animate-pulse rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onCreateCollection, onGenerateWithAI }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <Brain className='h-16 w-16 text-neutral-300 mb-4' />
      <h2 className='text-2xl font-semibold mb-2'>No collections yet</h2>
      <p className='text-neutral-600 mb-6 text-center max-w-md'>
        Create your first flashcard collection or generate one with AI to get started with your learning journey.
      </p>
      <div className='flex gap-4'>
        <Button variant='outline' onClick={onGenerateWithAI}>
          Generate with AI
        </Button>
        <Button variant='primary' onClick={onCreateCollection}>
          Create Collection
        </Button>
      </div>
    </div>
  );
}
