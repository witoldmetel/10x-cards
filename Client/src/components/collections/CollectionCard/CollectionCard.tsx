import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { TagBadge } from '@/components/ui/tag-badge';
import { CollectionIcon } from '@/components/collections/CollectionIcon/CollectionIcon';
import { CollectionCardProps } from '@/routes/Dashboard';

export function CollectionCard({ ...collection }: CollectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <CollectionIcon color={collection.color} size='lg' />
          <div>
            <CardTitle>{collection.name}</CardTitle>
            <CardDescription>{collection.description}</CardDescription>
          </div>
        </div>

        {/* Display categories and tags */}
        <div className='flex flex-wrap gap-2 mt-2'>
          {collection.categories &&
            collection.categories.length > 0 &&
            collection.categories?.map(category => (
              <TagBadge key={`category-${category}`} text={category} variant='category' />
            ))}
          {collection.tags &&
            collection.tags.length > 0 &&
            collection.tags?.map(tag => <TagBadge key={`tag-${tag}`} text={tag} variant='tag' />)}
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-2 text-sm'>
          <div>
            <p className='text-muted-foreground'>Total Cards</p>
            <p className='font-medium'>{collection.cardCount}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Due Cards</p>
            <p className='font-medium'>{collection.dueCards}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Last Studied</p>
            <p className='font-medium'>{collection.lastStudied}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Mastery</p>
            <p className='font-medium'>{collection.masteryLevel}%</p>
          </div>
        </div>
        <div className='w-full bg-muted rounded-full h-1.5 mt-4'>
          <div className='bg-primary rounded-full h-1.5' style={{ width: `${collection.masteryLevel}%` }}></div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/collections/${collection.id}`} className='w-full'>
          <Button variant='outline' className='w-full justify-between'>
            <span>{collection.dueCards > 0 ? 'Review Cards' : 'View Collection'}</span>
            <ArrowRight size={16} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
