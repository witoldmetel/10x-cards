import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/tailwind';

export interface FlashcardProps {
  front: string;
  back: string;
  onFlip?: () => void;
  className?: string;
}

export function Flashcard({ front, back, onFlip, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <div className={cn('relative w-full h-56 md:h-64 perspective-1000 cursor-pointer', className)} onClick={handleFlip}>
      <motion.div
        className='absolute inset-0 backface-hidden rounded-2xl shadow-card overflow-hidden'
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1.0, 0.22, 1.0] }}>
        <div className='absolute inset-0 bg-white p-6 flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-lg md:text-xl text-neutral-900'>{front}</p>
            <p className='text-sm text-neutral-500 mt-2'>Click to flip</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className='absolute inset-0 backface-hidden rounded-2xl shadow-card overflow-hidden'
        initial={{ rotateY: 180 }}
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ duration: 0.6, ease: [0.19, 1.0, 0.22, 1.0] }}>
        <div className='absolute inset-0 bg-primary-50 p-6 flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-lg md:text-xl text-neutral-900'>{back}</p>
            <p className='text-sm text-neutral-500 mt-2'>Click to flip back</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
