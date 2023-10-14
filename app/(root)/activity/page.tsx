import ProfileHeader from '@/components/shared/ProfileHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileTabs } from '@/constants';
import { FetchUser, FetchUsers, GetActivity } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import ThreadsTab from '@/components/shared/ThreadsTab';
import UserCard from '@/components/cards/UserCard';
import Link from 'next/link';

export default async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await FetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  const activity = await GetActivity(userInfo._id);

  return (
    <section>
      <h1 className='head-text mb-10'>Activity</h1>
      <section className='mt-10 flex flex-col gap-5'>
        {activity.length ? (
          <>
            {activity.map((activity) => (
              <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                <article className='activity-card'>
                  <Image
                    src={activity.author.image}
                    alt='Profile picture'
                    width={20}
                    height={20}
                    className='rounded-full object-cover'
                  />
                  <p className='!text-small-regular text-light-1'>
                    <span className='mr-1 text-primary-500'>{activity.author.name}</span> replied to your
                    thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No activity yet</p>
        )}
      </section>
    </section>
  );
}
