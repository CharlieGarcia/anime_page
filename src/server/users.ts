import { eq } from 'drizzle-orm';
import type { Database } from './db/client';
import { users, type User } from './db/schema';

// What we copy from the auth provider when a user is first seen
export type NewUserProfile = {
  displayName: string;
  avatarUrl: string | null;
};

export async function getUser(db: Database, id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

// Returns the user's row, creating it on their first request.
// loadProfile is only called when the row does not exist yet.
export async function ensureUser(
  db: Database,
  id: string,
  loadProfile: () => Promise<NewUserProfile>
): Promise<User> {
  const existing = await getUser(db, id);
  if (existing) return existing;

  const profile = await loadProfile();
  // Two first requests can race; the loser of the insert reads the winner's row
  const [created] = await db
    .insert(users)
    .values({ id, ...profile })
    .onConflictDoNothing({ target: users.id })
    .returning();

  return created ?? (await getUser(db, id))!;
}
