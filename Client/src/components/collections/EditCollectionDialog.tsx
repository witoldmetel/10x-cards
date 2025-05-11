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
import { CollectionIcon } from './CollectionIcon';
import { CollectionResponse } from '@/api/collections/types';
import { useUpdateCollection } from '@/api/collections/mutations';

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
  categories: z.string().optional(),
  tags: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function EditCollectionDialog({ open, onOpenChange, collection }: EditCollectionDialogProps) {
  const updateCollectionMutation = useUpdateCollection();

  // Initialize form with React Hook Form + Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || '',
      categories: collection.categories.join(', '),
      tags: collection.tags.join(', '),
      color: collection.color || PRESET_COLORS[0],
    },
  });

  const onSubmit = (data: FormValues) => {
    updateCollectionMutation.mutate({
      id: collection.id,
      collection: {
        name: data.name,
        description: data.description || '',
        categories: data.categories
          ? data.categories
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        tags: data.tags
          ? data.tags
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        color: data.color,
      },
    });

    toast.success('Collection updated successfully');
    onOpenChange(false);
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
                name='categories'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Science, Math, etc. (comma separated)' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='vocabulary, grammar, etc. (comma separated)' />
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
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className='flex flex-wrap gap-2'>
                        {PRESET_COLORS.map(color => (
                          <button
                            key={color}
                            type='button'
                            className={`w-6 h-6 rounded-full ${
                              color === field.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => form.setValue('color', color)}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
