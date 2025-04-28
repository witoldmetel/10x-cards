export default function ArchivedFlashcards() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Archived Flashcards</h1>
            {/* {statistics && (
              <div className='text-gray-600'>
                <p className='text-lg'>Total archived: {statistics.totalArchived}</p>
                <div className='text-sm mt-1'>
                  {Object.entries(statistics.archivedByCategory).map(([category, count]) => (
                    <span key={category} className='mr-4'>
                      {category}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* {error && (
            <div className='bg-red-50 text-red-700 p-4 rounded-lg mb-6'>
              <p className='font-medium'>Error</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading && page === 1 ? (
            <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
              <p className='mt-4 text-gray-600'>Loading archived flashcards...</p>
            </div>
          ) : flashcards && flashcards.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
              <p className='text-lg text-gray-600'>No archived flashcards found.</p>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='bg-white rounded-lg shadow-sm p-6'>
                  <FlashcardList flashcards={flashcards} />
              </div>
              {hasMore && (
                <div className='text-center pt-4'>
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'>
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}*/}
        </div>
      </main>
    </div>
  );
}
