import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/tailwind';
import { Flashcard } from '@/api/flashcard/types';

type FlashcardViewProps = {
  flashcard: Flashcard;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onGrade: (grade: number) => void;
};

export function FlashcardView({ flashcard, showAnswer, onShowAnswer, onGrade }: FlashcardViewProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleShowAnswer = () => {
    setIsFlipping(true);
    setTimeout(() => {
      onShowAnswer();
      setIsFlipping(false);
    }, 300);
  };

  return (
    <div className='flex flex-col items-center'>
      <div className='w-full max-w-3xl mb-6'>
        <div className={cn('w-full h-64 sm:h-80 flashcard-transform perspective', isFlipping && 'animate-flip')}>
          <Card className={cn('w-full h-full p-6 sm:p-8 flex flex-col', showAnswer && 'hidden')}>
            <div className='flex-1 flex items-center justify-center'>
              <h3 className='text-xl sm:text-2xl font-medium text-center'>{flashcard.front}</h3>
            </div>
            <div className='mt-auto pt-4 flex justify-center'>
              {!showAnswer && <Button onClick={handleShowAnswer}>Show Answer</Button>}
            </div>
          </Card>

          <Card className={cn('w-full h-full p-6 sm:p-8 flex flex-col', !showAnswer && 'hidden')}>
            <div className='flex-1 overflow-auto'>
              <div className='mb-4'>
                <h3 className='text-lg font-medium mb-2'>Question:</h3>
                <p>{flashcard.front}</p>
              </div>
              <div>
                <h3 className='text-lg font-medium mb-2'>Answer:</h3>
                <p>{flashcard.back}</p>
              </div>
            </div>

            <div className='mt-auto pt-4'>
              <h4 className='text-center mb-2 text-sm text-muted-foreground'>How well did you know this?</h4>
              <div className='grid grid-cols-4 gap-2'>
                <Button variant='outline' className='border-red-500/20 hover:bg-red-500/10' onClick={() => onGrade(1)}>
                  Forgot
                </Button>
                <Button
                  variant='outline'
                  className='border-orange-500/20 hover:bg-orange-500/10'
                  onClick={() => onGrade(2)}>
                  Hard
                </Button>
                <Button
                  variant='outline'
                  className='border-yellow-500/20 hover:bg-yellow-500/10'
                  onClick={() => onGrade(3)}>
                  Good
                </Button>
                <Button
                  variant='outline'
                  className='border-green-500/20 hover:bg-green-500/10'
                  onClick={() => onGrade(4)}>
                  Easy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
