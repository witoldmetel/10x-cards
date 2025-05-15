import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUpdateUser, useDeleteUser, useUpdatePassword } from '@/api/user/mutations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    newPassword: z
      .string()
      .min(12, 'Password must be at least 12 characters.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

const apiSchema = z.object({
  openRouterApiKey: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type ApiFormValues = z.infer<typeof apiSchema>;

export default function Settings() {
  const navigate = useNavigate();
  const { user, onLogout } = useAuth();
  const updateUserMutation = useUpdateUser(user?.userId || '');
  const deleteUserMutation = useDeleteUser(user?.userId || '');
  const updatePasswordMutation = useUpdatePassword(user?.userId || '');

  const [isUpdatingApiKeys, setIsUpdatingApiKeys] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const apiForm = useForm<ApiFormValues>({
    resolver: zodResolver(apiSchema),
    defaultValues: {
      openRouterApiKey: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    await updateUserMutation.mutateAsync({
      name: data.name,
      email: data.email,
      apiModelKey: user?.apiModelKey,
    });
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    await updatePasswordMutation.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const onApiSubmit = async () => {
    try {
      setIsUpdatingApiKeys(true);
      // In a real app, this would update API keys via API
      console.log('Updating API keys');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('API key saved successfully!');
    } catch (error) {
      console.error('Failed to update API keys', error);
      toast.error('Failed to update API keys. Please try again.');
    } finally {
      setIsUpdatingApiKeys(false);
    }
  };

  const handleDeleteAccount = async () => {
    await deleteUserMutation.mutateAsync();

    onLogout();
  };

  return (
    <div>
      <Button variant='ghost' size='sm' className='mb-6' onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} className='mr-2' /> Back to Dashboard
      </Button>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <h1 className='text-3xl font-bold'>User Settings</h1>
      </div>

      <Tabs defaultValue='profile' className='space-y-8'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <TabsTrigger value='api' disabled>API Keys</TabsTrigger>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>This feature is coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>

        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className='space-y-6'>
                  <FormField
                    control={profileForm.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type='email' {...field} />
                        </FormControl>
                        <FormDescription>Changing your email will require verification.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>Permanently delete your account and all your data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground mb-4'>
                This action cannot be undone. Once you delete your account, all your data will be permanently removed
                from our systems.
              </div>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant='destructive'>Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                      variant='destructive' 
                      onClick={handleDeleteAccount}
                      disabled={deleteUserMutation.isPending}
                    >
                      {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security'>
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to enhance your account security.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='space-y-6'>
                  <FormField
                    control={passwordForm.control}
                    name='currentPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type='password' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name='newPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type='password' {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 12 characters and include a number and special character.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type='password' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' disabled={updatePasswordMutation.isPending}>
                    {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* @todo: Add login sessions */}
          {/* <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
              <CardDescription>Manage your active login sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between py-2'>
                  <div>
                    <p className='font-medium'>Current Session</p>
                    <p className='text-sm text-muted-foreground'>Last active: Just now</p>
                  </div>
                  <div className='text-sm text-primary'>Current</div>
                </div>
                <Separator />
                <div className='flex items-center justify-between py-2'>
                  <div>
                    <p className='font-medium'>Chrome on Windows</p>
                    <p className='text-sm text-muted-foreground'>Last active: 2 days ago</p>
                  </div>
                  <Button variant='outline' size='sm'>
                    Log out
                  </Button>
                </div>
                <Separator />
                <div className='flex items-center justify-between py-2'>
                  <div>
                    <p className='font-medium'>Safari on iPhone</p>
                    <p className='text-sm text-muted-foreground'>Last active: 1 week ago</p>
                  </div>
                  <Button variant='outline' size='sm'>
                    Log out
                  </Button>
                </div>
              </div>
              <Button variant='ghost' className='mt-4 w-full'>
                Log out from all other sessions
              </Button>
            </CardContent>
          </Card> */}
        </TabsContent>

        <TabsContent value='api'>
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for third-party services.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className='space-y-6'>
                  <FormField
                    control={apiForm.control}
                    name='openRouterApiKey'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Key size={16} /> OpenRouter API Key
                        </FormLabel>
                        <FormControl>
                          <Input type='password' placeholder='Enter your OpenRouter API key' {...field} />
                        </FormControl>
                        <FormDescription>
                          Your API key is securely encrypted. This allows higher limits and better models when
                          generating flashcards.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' disabled={isUpdatingApiKeys}>
                    {isUpdatingApiKeys ? 'Saving...' : 'Save API Key'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
