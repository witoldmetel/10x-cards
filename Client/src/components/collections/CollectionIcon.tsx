import { BookOpen } from 'lucide-react';

type CollectionIconProps = {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function CollectionIcon({ color = '#60a5fa', size = 'md', className = '' }: CollectionIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-md ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: color }}>
      <BookOpen size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} className='text-white' />
    </div>
  );
}
