import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from './db/client';
import { users, type User } from './db/schema';
import { HttpError } from './errors';

// What we copy from the auth provider when a user is first seen
export type NewUserProfile = {
  displayName: string;
  avatarUrl: string | null;
};

// The part of a user anyone may see
export type PublicProfile = Pick<
  User,
  'username' | 'displayName' | 'avatarUrl' | 'bio' | 'createdAt'
>;

export const DISPLAY_NAME_MAX = 50;
export const BIO_MAX = 300;

// Any subset of the editable fields. Usernames are stored lower-case.
const profileUpdateSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Enter a display name')
      .max(DISPLAY_NAME_MAX, `Use ${DISPLAY_NAME_MAX} characters or fewer`),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z0-9_]{3,20}$/,
        'Use 3 to 20 letters, numbers or underscores'
      ),
    bio: z.string().trim().max(BIO_MAX, `Use ${BIO_MAX} characters or fewer`)
  })
  .partial();

const USERNAME_TAKEN = new HttpError(409, 'That username is taken', {
  username: 'That username is taken'
});

// Postgres reports a broken unique constraint with this code
function isUniqueViolation(error: unknown): boolean {
  const withCode = error as { code?: string; cause?: { code?: string } };
  return withCode?.code === '23505' || withCode?.cause?.code === '23505';
}

export function toPublicProfile(user: User): PublicProfile {
  const { username, displayName, avatarUrl, bio, createdAt } = user;
  return { username, displayName, avatarUrl, bio, createdAt };
}

export async function getUser(db: Database, id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function getUserByUsername(
  db: Database,
  username: string
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.trim().toLowerCase()));
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

// Applies the user's edits to their own profile and returns the updated row.
// Throws a 400 with a message per invalid field, or a 409 for a taken username.
export async function updateProfile(
  db: Database,
  id: string,
  input: unknown
): Promise<User> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '');
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    throw new HttpError(400, 'Check the highlighted fields', fieldErrors);
  }

  const changes = parsed.data;
  if (Object.keys(changes).length === 0) {
    throw new HttpError(400, 'Nothing to update');
  }

  if (changes.username) {
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, changes.username), ne(users.id, id)));
    if (taken) throw USERNAME_TAKEN;
  }

  try {
    const [updated] = await db
      .update(users)
      .set(changes)
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new HttpError(404, 'User not found');
    return updated;
  } catch (error) {
    // Someone else took the username between the check and the update
    if (isUniqueViolation(error)) throw USERNAME_TAKEN;
    throw error;
  }
}
