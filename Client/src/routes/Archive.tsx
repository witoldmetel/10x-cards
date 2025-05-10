import { useCollections } from '@/api/collections/queries';

import CollectionCard from '@/components/CollectionCard';

import { useNavigate } from 'react-router';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Archive() {
  const navigate = useNavigate();
  const { data, isLoading } = useCollections();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Archived Collections</h1>
      </div>

      {!data || data.totalCount === 0 ? (
        <EmptyState />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {data.collections.map(collection => (
            <CollectionCard
              collection={collection}
              onView={() => navigate(`/collections/${collection.id}`)}
              onStudy={() => {}}
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
      <div className='flex justify-between items-center mb-8'>
        <div className='h-8 w-48 bg-neutral-200 animate-pulse rounded'></div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[1, 2, 3].map(i => (
          <Card key={i} className='h-64'>
            <CardHeader>
              <div className='flex justify-between'>
                <div className='flex-1'>
                  <div className='h-6 w-3/4 bg-neutral-200 animate-pulse rounded mb-2'></div>
                  <div className='h-4 w-full bg-neutral-200 animate-pulse rounded'></div>
                </div>
                <div className='h-10 w-10 bg-neutral-200 animate-pulse rounded-full'></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='h-4 w-full bg-neutral-200 animate-pulse rounded mt-4'></div>
              <div className='h-4 w-3/4 bg-neutral-200 animate-pulse rounded mt-2'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <RotateCcw className='h-16 w-16 text-neutral-300 mb-4' />
      <h2 className='text-2xl font-semibold mb-2'>No archived collections</h2>
      <p className='text-neutral-600 mb-6 text-center max-w-md'>Collections that you archive will appear here.</p>
    </div>
  );
}
