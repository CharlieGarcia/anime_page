import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { TOP_ANIME_MAX } from '@/constants';
import type { AnimeSnapshot } from '@/helpers/animeSnapshot';
import type { Database } from './db/client';
import { topAnime, users, type TopAnimeRow } from './db/schema';
import { HttpError } from './errors';
import { getUserByUsername } from './users';

export { TOP_ANIME_MAX };

// Looks several anime up on Kitsu in one request, keyed by anime id. Ids Kitsu
// doesn't know are missing from the map; throws when Kitsu can't be reached.
// The app passes loadAnimeSnapshots from kitsu.ts.
export type LoadAnimeBatch = (
  animeIds: string[]
) => Promise<Map<string, AnimeSnapshot>>;

// One rank of a top 10 as the API returns it (no user id)
export type TopAnimeItem = Omit<TopAnimeRow, 'userId'>;

// Kitsu ids are numeric strings
const animeIdSchema = z
  .string({ error: 'Enter an anime id' })
  .regex(/^\d{1,10}$/, 'Enter a valid anime id');

const addSchema = z.object({ animeId: animeIdSchema });

const setSchema = z.object(
  {
    animeIds: z
      .array(animeIdSchema, { error: 'Send animeIds as a list of anime ids' })
      .max(TOP_ANIME_MAX, `Your top 10 can hold at most ${TOP_ANIME_MAX} anime`)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        'Each anime can appear only once in your top 10'
      )
  },
  { error: 'Send animeIds as a list of anime ids' }
);

const TOP_FULL = new HttpError(409, 'Your top 10 is full');

function kitsuDown(what: string): HttpError {
  return new HttpError(
    502,
    `Couldn't reach Kitsu to look up ${what}. Try again in a moment.`
  );
}

function parseAnimeId(input: unknown): string {
  const parsed = animeIdSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0].message;
    throw new HttpError(400, message, { animeId: message });
  }
  return parsed.data;
}

function parseAnimeIds(input: unknown): string[] {
  const parsed = setSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0].message;
    throw new HttpError(400, message, { animeIds: message });
  }
  return parsed.data.animeIds;
}

// Every column but the user id, so queries return TopAnimeItem directly
const itemColumns = {
  rank: topAnime.rank,
  animeId: topAnime.animeId,
  title: topAnime.title,
  posterUrl: topAnime.posterUrl,
  subtype: topAnime.subtype
};

// Locking the user's row makes concurrent writes to one top 10 take turns, so the
// cap holds and ranks stay 1 to n with no gaps
async function lockUser(tx: Database, userId: string): Promise<void> {
  await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .for('update');
}

// Replaces the user's whole list, ranking the items in the order given.
// Postgres checks the primary key row by row, so shifting ranks in place with
// UPDATE could collide; deleting and inserting again can't.
async function writeList(
  tx: Database,
  userId: string,
  items: Omit<TopAnimeItem, 'rank'>[]
): Promise<void> {
  await tx.delete(topAnime).where(eq(topAnime.userId, userId));
  if (items.length === 0) return;
  await tx.insert(topAnime).values(
    items.map(({ animeId, title, posterUrl, subtype }, index) => ({
      userId,
      rank: index + 1,
      animeId,
      title,
      posterUrl,
      subtype
    }))
  );
}

// The user's top 10, best first
export async function getTopAnime(
  db: Database,
  userId: string
): Promise<TopAnimeItem[]> {
  return db
    .select(itemColumns)
    .from(topAnime)
    .where(eq(topAnime.userId, userId))
    .orderBy(asc(topAnime.rank));
}

// Replaces the user's top 10 with { animeIds } in rank order and returns the saved
// list. Anime already in the list keep their stored snapshot; only new ones are
// looked up on Kitsu, in one request. Throws a 400 for more than 10, a duplicate
// or an invalid id, 404 naming the ids Kitsu doesn't know and 502 when Kitsu
// can't be reached.
export async function setTopAnime(
  db: Database,
  userId: string,
  input: unknown,
  loadAnime: LoadAnimeBatch
): Promise<TopAnimeItem[]> {
  const animeIds = parseAnimeIds(input);

  const stored = new Map(
    (await getTopAnime(db, userId)).map((item) => [item.animeId, item])
  );
  const newIds = animeIds.filter((animeId) => !stored.has(animeId));

  let fetched = new Map<string, AnimeSnapshot>();
  if (newIds.length > 0) {
    try {
      fetched = await loadAnime(newIds);
    } catch (error) {
      console.error(error);
      throw kitsuDown('these anime');
    }
  }
  const unknown = newIds.filter((animeId) => !fetched.has(animeId));
  if (unknown.length > 0) {
    const message = `No anime with ${unknown.length === 1 ? 'id' : 'ids'} ${unknown.join(', ')}`;
    throw new HttpError(404, message, { animeIds: message });
  }

  const items = animeIds.map((animeId) => ({
    animeId,
    ...(stored.get(animeId) ?? fetched.get(animeId)!)
  }));

  return db.transaction(async (tx) => {
    await lockUser(tx, userId);
    await writeList(tx, userId, items);
    return getTopAnime(tx, userId);
  });
}

// Adds { animeId } at the next free rank and returns the whole list, with the
// snapshot taken from Kitsu (never from the request). created is false when it was
// already in the list. Throws a 400 for an invalid id, 404 for an anime Kitsu
// doesn't have, 409 for a full list and 502 when Kitsu can't be reached.
export async function addToTopAnime(
  db: Database,
  userId: string,
  input: unknown,
  loadAnime: LoadAnimeBatch
): Promise<{ items: TopAnimeItem[]; created: boolean }> {
  const body = addSchema.safeParse(input);
  const animeId = parseAnimeId(body.success ? body.data.animeId : undefined);

  // Fail fast before calling Kitsu; checked again below while the user's row is locked
  const current = await getTopAnime(db, userId);
  if (current.some((item) => item.animeId === animeId)) {
    return { items: current, created: false };
  }
  if (current.length >= TOP_ANIME_MAX) throw TOP_FULL;

  let snapshot: AnimeSnapshot | undefined;
  try {
    snapshot = (await loadAnime([animeId])).get(animeId);
  } catch (error) {
    console.error(error);
    throw kitsuDown('this anime');
  }
  if (!snapshot) throw new HttpError(404, 'No anime with that id');

  return db.transaction(async (tx) => {
    await lockUser(tx, userId);
    const items = await getTopAnime(tx, userId);
    // Another request added the same anime while we were asking Kitsu
    if (items.some((item) => item.animeId === animeId)) {
      return { items, created: false };
    }
    if (items.length >= TOP_ANIME_MAX) throw TOP_FULL;

    // Ranks have no gaps, so the next free rank is one past the count
    await tx
      .insert(topAnime)
      .values({ userId, rank: items.length + 1, animeId, ...snapshot });
    return { items: await getTopAnime(tx, userId), created: true };
  });
}

// Removes an anime from the user's top 10; every anime ranked below it moves up one.
// Removing one that isn't there is fine.
export async function removeFromTopAnime(
  db: Database,
  userId: string,
  animeIdInput: unknown
): Promise<void> {
  const animeId = parseAnimeId(animeIdInput);

  await db.transaction(async (tx) => {
    await lockUser(tx, userId);
    const items = await getTopAnime(tx, userId);
    if (!items.some((item) => item.animeId === animeId)) return;
    await writeList(
      tx,
      userId,
      items.filter((item) => item.animeId !== animeId)
    );
  });
}

// Anyone's top 10, for their public profile. Throws a 404 for an unknown username
// and a 403 when the owner has made it private.
export async function getPublicTopAnime(
  db: Database,
  username: string
): Promise<TopAnimeItem[]> {
  const user = await getUserByUsername(db, username);
  if (!user) throw new HttpError(404, 'No user with that username');
  if (!user.topAnimePublic) throw new HttpError(403, 'This top 10 is private');
  return getTopAnime(db, user.id);
}
