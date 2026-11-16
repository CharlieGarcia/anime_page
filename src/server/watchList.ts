import { and, count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from './db/client';
import {
  users,
  WATCH_LIST_STATUSES,
  watchListItems,
  type WatchListItemRow
} from './db/schema';
import { HttpError } from './errors';
import type { AnimeSnapshot } from '@/helpers/animeSnapshot';
import { getUserByUsername } from './users';

export type { AnimeSnapshot };

// Looks an anime up on Kitsu. Returns null when there is no anime with that id,
// throws when Kitsu can't be reached. The app passes loadAnimeSnapshot from kitsu.ts.
export type LoadAnime = (animeId: string) => Promise<AnimeSnapshot | null>;

// One watch list entry as the API returns it (no user id)
export type WatchListItem = Omit<WatchListItemRow, 'userId'>;

export const WATCH_LIST_MAX = 500;

// Kitsu ids are numeric strings
const animeIdSchema = z
  .string({ error: 'Enter an anime id' })
  .regex(/^\d{1,10}$/, 'Enter a valid anime id');

const addSchema = z.object({ animeId: animeIdSchema });

// For requests that set a status. Nothing does yet: new items are always 'planned'.
export const watchListStatusSchema = z.enum(WATCH_LIST_STATUSES);

const LIST_FULL = new HttpError(
  409,
  `Your watch list is full (${WATCH_LIST_MAX} anime). Remove one to add another.`
);

function parseAnimeId(input: unknown): string {
  const parsed = animeIdSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0].message;
    throw new HttpError(400, message, { animeId: message });
  }
  return parsed.data;
}

// Every column but the user id, so queries return WatchListItem directly
const itemColumns = {
  animeId: watchListItems.animeId,
  status: watchListItems.status,
  title: watchListItems.title,
  posterUrl: watchListItems.posterUrl,
  subtype: watchListItems.subtype,
  addedAt: watchListItems.addedAt
};

async function getItem(
  db: Database,
  userId: string,
  animeId: string
): Promise<WatchListItem | null> {
  const [item] = await db
    .select(itemColumns)
    .from(watchListItems)
    .where(
      and(
        eq(watchListItems.userId, userId),
        eq(watchListItems.animeId, animeId)
      )
    );
  return item ?? null;
}

async function countItems(db: Database, userId: string): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(watchListItems)
    .where(eq(watchListItems.userId, userId));
  return total;
}

// The user's watch list, newest first
export async function getWatchList(
  db: Database,
  userId: string
): Promise<WatchListItem[]> {
  return db
    .select(itemColumns)
    .from(watchListItems)
    .where(eq(watchListItems.userId, userId))
    .orderBy(desc(watchListItems.addedAt), desc(watchListItems.animeId));
}

// Adds an anime to the user's watch list, with its title and poster taken from Kitsu
// (never from the request). created is false when it was already on the list.
// Throws a 400 for an invalid id, 404 for an anime Kitsu doesn't have, 409 for a full
// list and 502 when Kitsu can't be reached.
export async function addToWatchList(
  db: Database,
  userId: string,
  input: unknown,
  loadAnime: LoadAnime
): Promise<{ item: WatchListItem; created: boolean }> {
  const body = addSchema.safeParse(input);
  const animeId = parseAnimeId(body.success ? body.data.animeId : undefined);

  const existing = await getItem(db, userId, animeId);
  if (existing) return { item: existing, created: false };

  // Fail fast before calling Kitsu; checked again below while the user's row is locked
  if ((await countItems(db, userId)) >= WATCH_LIST_MAX) throw LIST_FULL;

  let snapshot: AnimeSnapshot | null;
  try {
    snapshot = await loadAnime(animeId);
  } catch (error) {
    console.error(error);
    throw new HttpError(
      502,
      "Couldn't reach Kitsu to look up this anime. Try again in a moment."
    );
  }
  if (!snapshot) throw new HttpError(404, 'No anime with that id');

  const inserted = await db.transaction(async (tx) => {
    // Locking the user's row makes concurrent adds take turns, so the cap holds
    await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .for('update');
    if ((await countItems(tx, userId)) >= WATCH_LIST_MAX) throw LIST_FULL;

    const [row] = await tx
      .insert(watchListItems)
      .values({
        userId,
        animeId,
        status: 'planned',
        ...snapshot
      })
      .onConflictDoNothing()
      .returning(itemColumns);
    return row;
  });

  if (inserted) return { item: inserted, created: true };
  // Another request added the same anime while we were asking Kitsu
  return {
    item: (await getItem(db, userId, animeId))!,
    created: false
  };
}

// Removes an anime from the user's watch list. Removing one that isn't there is fine.
export async function removeFromWatchList(
  db: Database,
  userId: string,
  animeIdInput: unknown
): Promise<void> {
  const animeId = parseAnimeId(animeIdInput);
  await db
    .delete(watchListItems)
    .where(
      and(
        eq(watchListItems.userId, userId),
        eq(watchListItems.animeId, animeId)
      )
    );
}

// Anyone's watch list, for their public profile. Throws a 404 for an unknown
// username and a 403 when the owner has made the list private.
export async function getPublicWatchList(
  db: Database,
  username: string
): Promise<WatchListItem[]> {
  const user = await getUserByUsername(db, username);
  if (!user) throw new HttpError(404, 'No user with that username');
  if (!user.watchListPublic) {
    throw new HttpError(403, 'This watch list is private');
  }
  return getWatchList(db, user.id);
}
