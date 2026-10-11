import type { NextApiRequest } from 'next';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { getDb } from './db/client';
import type { User } from './db/schema';
import { ensureUser, type NewUserProfile } from './users';

async function loadClerkProfile(userId: string): Promise<NewUserProfile> {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ');

  return {
    displayName: fullName || clerkUser.username || 'Anime fan',
    avatarUrl: clerkUser.imageUrl || null
  };
}

// The signed-in user making this API request, or null when signed out.
// Their row is created the first time they are seen.
export async function requireUser(req: NextApiRequest): Promise<User | null> {
  const { userId } = getAuth(req);
  if (!userId) return null;

  return ensureUser(getDb(), userId, () => loadClerkProfile(userId));
}
