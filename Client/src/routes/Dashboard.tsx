import { Brain, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFlashcards } from '@/api/flashcard/queries';
import CollectionCard from '@/components/CollectionCard';
import { FlashcardsListResponse } from '@/db/database.types';

type EmptyStateProps = {
  onCreateCollection: () => void;
  onGenerateWithAI: () => void;
}



export default function Dashboard() {
  const { data, isLoading } = useFlashcards<FlashcardsListResponse>();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Flashcards</h1>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            leftIcon={<Brain className="h-4 w-4" />}
            onClick={() => {}}
          >
            Generate with AI
          </Button>
          <Button 
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {}}
          >
            Create Collection
          </Button>
        </div>
      </div>
      
      {data?.pagination?.total === 0 ? (
        <EmptyState
          onCreateCollection={() => {}}
          onGenerateWithAI={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.items.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onStudy={() => console.log(collection.id)}
              onView={() => console.log(collection.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-[200px] animate-pulse">
          <CardHeader className="h-full bg-neutral-100 rounded-lg" />
          <CardContent className="h-16 bg-neutral-100 rounded-lg mt-4" />
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onCreateCollection, onGenerateWithAI }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Brain className="h-16 w-16 text-neutral-300 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">No collections yet</h2>
      <p className="text-neutral-600 mb-6 text-center max-w-md">
        Create your first flashcard collection or generate one with AI to get started with your learning journey.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onGenerateWithAI}>
          Generate with AI
        </Button>
        <Button variant="primary" onClick={onCreateCollection}>
          Create Collection
        </Button>
      </div>
    </div>
  );
}