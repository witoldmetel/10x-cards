import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/tailwind';
import { Tag } from 'lucide-react';

type TagBadgeProps = {
  text: string;
  variant?: 'default' | 'category' | 'tag';
  className?: string;
};

const getTagColor = (variant: 'default' | 'category' | 'tag'): string => {
  switch (variant) {
    case 'category':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'tag':
      return 'bg-emerald-500 hover:bg-emerald-600';
    default:
      return '';
  }
};

export function TagBadge({ text, variant = 'default', className }: TagBadgeProps) {
  return (
    <Badge className={cn('flex items-center gap-1', getTagColor(variant), className)}>
      {variant === 'category' ? (
        <span className='h-3.5 w-3.5'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <circle cx='12' cy='12' r='10' />
            <polygon points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' />
          </svg>
        </span>
      ) : variant === 'tag' ? (
        <Tag size={14} />
      ) : null}
      {text}
    </Badge>
  );
}
