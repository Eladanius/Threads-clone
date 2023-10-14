'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '../ui/button';
import * as z from 'zod';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { useUploadThing } from '@/lib/uploadthing';
import { usePathname, useRouter } from 'next/navigation';
import { ThreadValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/thread.actions';

export default function PostThread({ userId }: { userId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing('media');
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      accountId: userId,
    },
  });

  async function onSubmit(values: z.infer<typeof ThreadValidation>) {
    await createThread({ text: values.thread, author: userId, communityId: null, path: pathname });
    router.push('/');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='mt-10 flex flex-col justify-start gap-10'>
        <FormField
          control={form.control}
          name='thread'
          render={({ field }) => (
            <FormItem className='flex flex-col w-full gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>Content</FormLabel>
              <FormControl className='text-base-semibold text-ligt-2 gap-3 w-full'>
                <Textarea rows={15} className='account-form_input no-focus' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-primary-500'>
          Post Thread
        </Button>
      </form>
    </Form>
  );
}
