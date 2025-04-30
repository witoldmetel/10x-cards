
import { useCollections } from '@/api/collections/queries';
import CollectionCard from '@/components/CollectionCard';
import { useMemo } from 'react';

import type { CollectionResponseDto } from '@/api/collections/types';


export default function Archive() {
  const { data: collectionsData, isLoading: isLoadingCollections, error: errorCollections } = useCollections();



  // Only show archived collections
  const archivedCollections: CollectionResponseDto[] = useMemo(() => {
    if (!collectionsData || !Array.isArray(collectionsData)) return [];
    return collectionsData.filter((col: CollectionResponseDto) => col.archivedAt);
  }, [collectionsData]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Archive</h1>
          </div>

          {/* Archived Collections Section */}
          <section className='mb-10'>
            <h2 className='text-2xl font-semibold mb-4'>Archived Collections</h2>
            {errorCollections && (
              <div className='bg-red-50 text-red-700 p-4 rounded-lg mb-6'>
                <p className='font-medium'>Error</p>
                <p>{errorCollections instanceof Error ? errorCollections.message : String(errorCollections)}</p>
              </div>
            )}
            {isLoadingCollections ? (
              <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
                <p className='mt-4 text-gray-600'>Loading archived collections...</p>
              </div>
            ) : archivedCollections.length === 0 ? (
              <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
                <p className='text-lg text-gray-600'>No archived collections found.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {archivedCollections.map(collection => (
                  <CollectionCard key={collection.id} collection={collection} onStudy={() => {}} onView={() => {}} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
