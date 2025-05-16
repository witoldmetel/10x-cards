import { cn } from '@/lib/tailwind';
import { HTMLAttributes } from 'react';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div className={cn('relative flex items-center justify-center', className)} {...props}>
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent',
          size === 'sm' ? 'h-4 w-4 border-2' : '',
          size === 'md' ? 'h-8 w-8 border-3' : '',
          size === 'lg' ? 'h-12 w-12 border-4' : '',
          'spinner-gradient',
        )}
      />
    </div>
  );
}
