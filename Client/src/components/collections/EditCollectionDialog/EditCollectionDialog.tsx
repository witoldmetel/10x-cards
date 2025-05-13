import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { toast } from 'sonner';
import { CollectionIcon } from '../CollectionIcon/CollectionIcon';
import { CollectionResponse } from '@/api/collections/types';
import { useUpdateCollection } from '@/api/collections/mutations';
import { useState } from 'react';
import { X } from 'lucide-react';
import { TagBadge } from '@/components/ui/tag-badge';

interface EditCollectionDialogProps {
  open: boolean;
  collection: CollectionResponse;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // light blue
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().min(1, 'Color is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function EditCollectionDialog({ open, onOpenChange, collection }: EditCollectionDialogProps) {
  const updateCollectionMutation = useUpdateCollection();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || '',
      categories: collection.categories,
      tags: collection.tags,
      color: collection.color || PRESET_COLORS[0],
    },
  });

  const onSubmit = (data: FormValues) => {
    updateCollectionMutation.mutate({
      id: collection.id,
      collection: {
        name: data.name,
        description: data.description || '',
        categories,
        tags,
        color: data.color,
      },
    });

    toast.success('Collection updated successfully');
    onOpenChange(false);
  };

  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>(collection.categories || []);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(collection.tags || []);

  const handleAddCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <CollectionIcon color={form.watch('color')} />
                Edit Collection
              </DialogTitle>
              <DialogDescription>Update your collection details below.</DialogDescription>
            </DialogHeader>

            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Collection name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder='A brief description' rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Color</FormLabel>
                    <FormControl>
                      <div className='flex flex-wrap gap-4 items-center'>
                        <div className='flex items-center gap-2'>
                          <div
                            className='w-8 h-8 rounded-full cursor-pointer ring-2 ring-offset-2 ring-gray-200 hover:ring-primary transition-all'
                            style={{ backgroundColor: field.value }}>
                            <input
                              type='color'
                              id='color'
                              {...field}
                              className='w-8 h-8 rounded-full cursor-pointer opacity-0'
                              title='Choose custom color'
                            />
                          </div>
                          <span className='text-sm text-gray-500'>Custom</span>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              type='button'
                              className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                                color === field.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => form.setValue('color', color)}
                              title='Select preset color'
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <FormLabel>Categories</FormLabel>
                <div className='flex gap-2'>
                  <Input
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    placeholder='Add a category'
                    className='flex-1'
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <Button type='button' onClick={handleAddCategory}>
                    Add
                  </Button>
                </div>
                {categories.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {categories.map(category => (
                      <div key={category} className='flex items-center'>
                        <TagBadge text={category} variant='category' />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-5 w-5 p-0 ml-1'
                          onClick={() => handleRemoveCategory(category)}>
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <FormLabel>Tags</FormLabel>
                <div className='flex gap-2'>
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder='Add a tag'
                    className='flex-1'
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type='button' onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {tags.map(tag => (
                      <div key={tag} className='flex items-center'>
                        <TagBadge text={tag} variant='tag' />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-5 w-5 p-0 ml-1'
                          onClick={() => handleRemoveTag(tag)}>
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
