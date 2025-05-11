import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Archive, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Flashcard } from '@/api/flashcard/types';
import { useArchiveFlashcard, useDeleteFlashcard, useUpdateFlashcard } from '@/api/flashcard/mutations';

interface FlashcardActionsProps {
  flashcard: Flashcard;
  onDelete?: () => void;
}

export function FlashcardActions({ flashcard, onDelete }: FlashcardActionsProps) {
  const updateFlashcardMutation = useUpdateFlashcard();
  const archiveFlashcardMutation = useArchiveFlashcard();
  const deleteFlashcardMutation = useDeleteFlashcard();

  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({
    front: flashcard.front,
    back: flashcard.back,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValues({
      front: flashcard.front,
      back: flashcard.back,
    });
  };

  const handleSave = () => {
    updateFlashcardMutation.mutate({
      id: flashcard.id,
      flashcard: {
        front: editedValues.front,
        back: editedValues.back,
      },
    });
    setIsEditing(false);
    toast.success('Flashcard updated');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedValues(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      await deleteFlashcardMutation.mutateAsync(flashcard.id);
      toast.success('Flashcard deleted');
      if (onDelete) onDelete();
    }
  };

  const handleArchive = async () => {
    await archiveFlashcardMutation.mutateAsync(flashcard.id);
    toast.success('Flashcard archived');
  };

  if (isEditing) {
    return (
      <div className='space-y-4'>
        <div>
          <h3 className='font-medium mb-1'>Question:</h3>
          <Textarea name='front' value={editedValues.front} onChange={handleChange} rows={2} />
        </div>
        <div>
          <h3 className='font-medium mb-1'>Answer:</h3>
          <Textarea name='back' value={editedValues.back} onChange={handleChange} rows={2} />
        </div>
        <div className='flex justify-end gap-2'>
          <Button type='button' size='sm' variant='outline' onClick={handleCancel} className='flex items-center gap-1'>
            <X size={16} /> Cancel
          </Button>
          <Button type='button' size='sm' onClick={handleSave} className='flex items-center gap-1'>
            <Check size={16} /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-end gap-2 mt-2'>
      <Button size='sm' variant='outline' onClick={handleEdit} className='h-8 w-8 p-0' title='Edit'>
        <Edit size={16} />
      </Button>
      <Button size='sm' variant='outline' onClick={handleArchive} className='h-8 w-8 p-0' title='Archive'>
        <Archive size={16} />
      </Button>
      <Button size='sm' variant='outline' onClick={handleDelete} className='h-8 w-8 p-0' title='Delete'>
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
