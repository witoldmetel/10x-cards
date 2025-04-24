import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FlashcardListItemDto } from '@/db/database.types';

interface FlashcardListProps {
  flashcards: FlashcardListItemDto[];
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
    <div className="space-y-6">
      <motion.div
        layout
        className="w-full max-w-3xl mx-auto grid gap-4 grid-cols-1 md:grid-cols-2"
      >
        <AnimatePresence mode="wait">
          {visibleCards.map(card => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleCard(card.id)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
            >
              <div className="relative w-full aspect-[3/2]">
                <div
                  className={`absolute inset-0 w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
                    flippedCards.has(card.id) ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex items-center justify-center p-4 text-center">
                    <p className="text-lg font-medium">{card.front}</p>
                  </div>
                  
                  {/* Back */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-lg">{card.back}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
