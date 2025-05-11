import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ArrowLeft, Pencil, Wand } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateFlashcardsOptions() {
  const navigate = useNavigate();

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} className='mr-2' /> Back to Dashboard
      </Button>

      <h1 className='text-3xl font-bold mb-6'>Create Flashcards</h1>
      <p className='text-muted-foreground mb-8'>Choose how you'd like to create your flashcards</p>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Manual Flashcard Creation Option */}
        <Card
          className='border-2 hover:border-primary hover:shadow-md transition-all cursor-pointer'
          onClick={() => navigate('/flashcards/create')}>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                <Pencil className='text-primary' />
              </div>
              Manual Flashcard Creation
            </CardTitle>
            <CardDescription>Create custom flashcards by manually entering questions and answers</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Perfect for creating flashcards with specific content or formatting. You have full control over the
              content of each card.
            </p>
          </CardContent>
        </Card>

        {/* AI Flashcard Generation Option */}
        <Card
          className='border-2 hover:border-primary hover:shadow-md transition-all cursor-pointer'
          onClick={() => navigate('/flashcards/generate')}>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                <Wand className='text-primary' />
              </div>
              AI Flashcard Generation
            </CardTitle>
            <CardDescription>Generate flashcards automatically from your text or notes</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Let our AI analyze your content and create relevant flashcards automatically, saving you time and effort.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
