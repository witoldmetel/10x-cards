import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flashcard } from '@/db/database.types';

interface FlashcardListProps {
  flashcards: Flashcard[];
}

const CARDS_PER_PAGE = 6;

export function FlashcardList({ flashcards }: FlashcardListProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(flashcards.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const visibleCards = flashcards.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setFlippedCards(new Set()); // Reset flipped cards when changing pages
  };

  const toggleCard = (id: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (flashcards.length === 0) {
    return null;
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AnimatePresence mode='wait'>
          {visibleCards.map(card => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className='relative h-48'>
              <div
                className={`absolute inset-0 p-4 rounded-lg shadow-md cursor-pointer transition-transform duration-500 transform-gpu ${
                  flippedCards.has(card.id) ? 'rotate-y-180' : ''
                }`}
                onClick={() => toggleCard(card.id)}
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}>
                <div
                  className={`absolute inset-0 p-4 bg-white rounded-lg ${
                    flippedCards.has(card.id) ? 'invisible' : ''
                  }`}>
                  <p className='text-lg font-medium'>{card.front}</p>
                  <div className='absolute bottom-4 left-4 flex flex-wrap gap-2'>
                    {card.tags.map(tag => (
                      <span key={tag} className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={`absolute inset-0 p-4 bg-white rounded-lg transform-gpu rotate-y-180 ${
                    flippedCards.has(card.id) ? '' : 'invisible'
                  }`}>
                  <p className='text-lg'>{card.back}</p>
                  <div className='absolute bottom-4 left-4 flex flex-wrap gap-2'>
                    {card.category.map(cat => (
                      <span key={cat} className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full'>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {totalPages > 1 && (
        <div className='flex justify-center gap-4 mt-6'>
          <Button variant='outline' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className='h-4 w-4' />
            Previous
          </Button>
          <Button
            variant='outline'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}>
            Next
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
