import { useState } from 'react';

interface FlashcardListProps {
  flashcards: any[];
}

export function FlashcardList({ flashcards }: FlashcardListProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleCard = (id: number) => {
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
    <div className='w-full max-w-3xl mx-auto grid gap-4 grid-cols-1 md:grid-cols-2'>
      {flashcards.map(card => (
        <div
          key={card.id}
          onClick={() => toggleCard(card.id)}
          className='bg-white rounded-lg shadow-md p-6 cursor-pointer transform transition-transform hover:scale-105'
        >
          <div className='relative w-full aspect-[3/2]'>
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
                flippedCards.has(card.id) ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* Front */}
              <div className='absolute inset-0 w-full h-full [backface-visibility:hidden] flex items-center justify-center p-4 text-center'>
                <p className='text-lg font-medium'>{card.question}</p>
              </div>

              {/* Back */}
              <div className='absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center p-4 bg-blue-50 rounded-lg text-center'>
                <p className='text-lg'>{card.answer}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
