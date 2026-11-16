// @vitest-environment node
import { eq, sql } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from './db/client';
import { topAnime, users } from './db/schema';
import { createTestDb } from './db/testDb';
import { HttpError } from './errors';
import {
  addToTopAnime,
  getPublicTopAnime,
  getTopAnime,
  removeFromTopAnime,
  setTopAnime,
  TOP_ANIME_MAX,
  type LoadAnimeBatch
} from './topAnime';
import { ensureUser, updateProfile } from './users';

// Stands in for Kitsu: every id is a known anime called "Anime <id>", except 404
const kitsu = vi.fn<LoadAnimeBatch>(
  async (animeIds) =>
    new Map(
      animeIds
        .filter((animeId) => animeId !== '404')
        .map((animeId) => [
          animeId,
          {
            title: `Anime ${animeId}`,
            posterUrl: `https://media.kitsu.app/${animeId}.jpg`,
            subtype: 'TV'
          }
        ])
    )
);

let db: Database;

beforeEach(async () => {
  kitsu.mockClear();
  db = await createTestDb();
  await ensureUser(db, 'user_1', async () => ({
    displayName: 'Spike Spiegel',
    avatarUrl: null
  }));
  await ensureUser(db, 'user_2', async () => ({
    displayName: 'Faye Valentine',
    avatarUrl: null
  }));
  await updateProfile(db, 'user_1', { username: 'spike' });
});

async function errorFrom(promise: Promise<unknown>): Promise<HttpError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HttpError) return error;
    throw error;
  }
  throw new Error('Expected an HttpError');
}

const ids = (count: number) =>
  Array.from({ length: count }, (_, index) => String(index + 1));

async function rankedIds(userId: string): Promise<string[]> {
  return (await getTopAnime(db, userId)).map((item) => item.animeId);
}

describe('setTopAnime', () => {
  it('saves the list in the order given, with snapshots from Kitsu', async () => {
    const items = await setTopAnime(
      db,
      'user_1',
      { animeIds: ['12', '1', '7'] },
      kitsu
    );

    expect(items).toEqual([
      {
        rank: 1,
        animeId: '12',
        title: 'Anime 12',
        posterUrl: 'https://media.kitsu.app/12.jpg',
        subtype: 'TV'
      },
      expect.objectContaining({ rank: 2, animeId: '1', title: 'Anime 1' }),
      expect.objectContaining({ rank: 3, animeId: '7', title: 'Anime 7' })
    ]);
    expect(await getTopAnime(db, 'user_1')).toEqual(items);
    // One batch request for all three
    expect(kitsu).toHaveBeenCalledTimes(1);
    expect(kitsu).toHaveBeenCalledWith(['12', '1', '7']);
  });

  it('takes the snapshot from Kitsu, not from the request', async () => {
    const [item] = await setTopAnime(
      db,
      'user_1',
      {
        animeIds: ['1'],
        title: 'Fake',
        items: [{ animeId: '1', title: 'Fake' }]
      },
      kitsu
    );

    expect(item.title).toBe('Anime 1');
  });

  it('reorders and removes without calling Kitsu, keeping stored snapshots', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1', '2', '3'] }, kitsu);
    await db.execute(
      sql`UPDATE top_anime SET title = 'Stored title' WHERE anime_id = '2'`
    );
    kitsu.mockClear();

    const items = await setTopAnime(
      db,
      'user_1',
      { animeIds: ['2', '1'] },
      kitsu
    );

    expect(kitsu).not.toHaveBeenCalled();
    expect(
      items.map(({ rank, animeId, title }) => [rank, animeId, title])
    ).toEqual([
      [1, '2', 'Stored title'],
      [2, '1', 'Anime 1']
    ]);
  });

  it('only asks Kitsu about the anime that are new', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1', '2'] }, kitsu);
    kitsu.mockClear();

    await setTopAnime(db, 'user_1', { animeIds: ['3', '1', '4'] }, kitsu);

    expect(kitsu).toHaveBeenCalledExactlyOnceWith(['3', '4']);
    expect(await rankedIds('user_1')).toEqual(['3', '1', '4']);
  });

  it('clears the list when given no ids', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1', '2'] }, kitsu);

    expect(await setTopAnime(db, 'user_1', { animeIds: [] }, kitsu)).toEqual(
      []
    );
    expect(await getTopAnime(db, 'user_1')).toEqual([]);
  });

  it.each([
    ['more than 10', { animeIds: ids(TOP_ANIME_MAX + 1) }],
    ['a duplicate', { animeIds: ['1', '2', '1'] }],
    ['an id that is not digits', { animeIds: ['1', 'abc'] }],
    ['an id that is not a string', { animeIds: [1] }],
    ['no animeIds', { animeId: '1' }],
    ['animeIds that are not a list', { animeIds: '1,2' }],
    ['a body that is not an object', 'nope']
  ])('gives a 400 for %s and keeps the list', async (_, body) => {
    await setTopAnime(db, 'user_1', { animeIds: ['9'] }, kitsu);
    kitsu.mockClear();

    const error = await errorFrom(setTopAnime(db, 'user_1', body, kitsu));

    expect(error.status).toBe(400);
    expect(error.fieldErrors?.animeIds).toBe(error.message);
    expect(kitsu).not.toHaveBeenCalled();
    expect(await rankedIds('user_1')).toEqual(['9']);
  });

  it('accepts exactly 10', async () => {
    const items = await setTopAnime(
      db,
      'user_1',
      { animeIds: ids(TOP_ANIME_MAX) },
      kitsu
    );

    expect(items.map((item) => item.rank)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    ]);
  });

  it('gives a 404 naming the ids Kitsu does not know, and keeps the list', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['9'] }, kitsu);

    const error = await errorFrom(
      setTopAnime(db, 'user_1', { animeIds: ['1', '404'] }, kitsu)
    );

    expect(error.status).toBe(404);
    expect(error.message).toBe('No anime with id 404');
    expect(await rankedIds('user_1')).toEqual(['9']);
  });

  it('names every unknown id', async () => {
    const none = vi.fn<LoadAnimeBatch>(async () => new Map());

    const error = await errorFrom(
      setTopAnime(db, 'user_1', { animeIds: ['5', '6'] }, none)
    );

    expect(error.message).toBe('No anime with ids 5, 6');
  });

  it('gives a 502 asking to retry when Kitsu cannot be reached', async () => {
    const down = vi.fn<LoadAnimeBatch>(async () => {
      throw new TypeError('fetch failed');
    });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});

    const error = await errorFrom(
      setTopAnime(db, 'user_1', { animeIds: ['1'] }, down)
    );

    expect(error.status).toBe(502);
    expect(error.message).toMatch(/try again/i);
    log.mockRestore();
  });

  it("leaves other users' lists alone", async () => {
    await setTopAnime(db, 'user_2', { animeIds: ['7'] }, kitsu);

    await setTopAnime(db, 'user_1', { animeIds: ['1'] }, kitsu);

    expect(await rankedIds('user_2')).toEqual(['7']);
  });
});

describe('addToTopAnime', () => {
  it('adds at the next free rank and returns the whole list', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1', '2'] }, kitsu);
    kitsu.mockClear();

    const { items, created } = await addToTopAnime(
      db,
      'user_1',
      { animeId: '3', title: 'Fake' },
      kitsu
    );

    expect(created).toBe(true);
    expect(kitsu).toHaveBeenCalledExactlyOnceWith(['3']);
    expect(items.map(({ rank, animeId }) => [rank, animeId])).toEqual([
      [1, '1'],
      [2, '2'],
      [3, '3']
    ]);
    expect(items[2].title).toBe('Anime 3');
  });

  it('treats adding the same anime again as a no-op', async () => {
    await addToTopAnime(db, 'user_1', { animeId: '1' }, kitsu);
    kitsu.mockClear();

    const { items, created } = await addToTopAnime(
      db,
      'user_1',
      { animeId: '1' },
      kitsu
    );

    expect(created).toBe(false);
    expect(items).toHaveLength(1);
    expect(kitsu).not.toHaveBeenCalled();
  });

  it('gives a 409 when the list is full, without calling Kitsu', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ids(TOP_ANIME_MAX) }, kitsu);
    kitsu.mockClear();

    const error = await errorFrom(
      addToTopAnime(db, 'user_1', { animeId: '99' }, kitsu)
    );

    expect(error.status).toBe(409);
    expect(error.message).toBe('Your top 10 is full');
    expect(kitsu).not.toHaveBeenCalled();
  });

  it('still treats an anime already in a full list as a no-op', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ids(TOP_ANIME_MAX) }, kitsu);

    const { created } = await addToTopAnime(
      db,
      'user_1',
      { animeId: '5' },
      kitsu
    );

    expect(created).toBe(false);
  });

  it('never goes past 10 when adds race', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ids(8) }, kitsu);

    const results = await Promise.allSettled(
      ['21', '22', '23', '24'].map((animeId) =>
        addToTopAnime(db, 'user_1', { animeId }, kitsu)
      )
    );

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2);
    const items = await getTopAnime(db, 'user_1');
    expect(items.map((item) => item.rank)).toEqual(ids(10).map(Number));
  });

  it('gives a 404 for an anime Kitsu does not have', async () => {
    const error = await errorFrom(
      addToTopAnime(db, 'user_1', { animeId: '404' }, kitsu)
    );

    expect(error.status).toBe(404);
    expect(await getTopAnime(db, 'user_1')).toEqual([]);
  });

  it('gives a 502 when Kitsu cannot be reached', async () => {
    const down = vi.fn<LoadAnimeBatch>(async () => {
      throw new TypeError('fetch failed');
    });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});

    const error = await errorFrom(
      addToTopAnime(db, 'user_1', { animeId: '1' }, down)
    );

    expect(error.status).toBe(502);
    log.mockRestore();
  });

  it.each([{ animeId: 'abc' }, { animeId: 1 }, {}, null])(
    'gives a 400 for %j',
    async (body) => {
      const error = await errorFrom(addToTopAnime(db, 'user_1', body, kitsu));

      expect(error.status).toBe(400);
      expect(error.fieldErrors?.animeId).toBeTruthy();
    }
  );

  it('counts the cap per user', async () => {
    await setTopAnime(db, 'user_2', { animeIds: ids(TOP_ANIME_MAX) }, kitsu);

    const { created } = await addToTopAnime(
      db,
      'user_1',
      { animeId: '1' },
      kitsu
    );

    expect(created).toBe(true);
  });
});

describe('removeFromTopAnime', () => {
  it('removes the anime and moves every anime below it up one rank', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1', '2', '3', '4'] }, kitsu);
    kitsu.mockClear();

    await removeFromTopAnime(db, 'user_1', '2');

    const items = await getTopAnime(db, 'user_1');
    expect(
      items.map(({ rank, animeId, title }) => [rank, animeId, title])
    ).toEqual([
      [1, '1', 'Anime 1'],
      [2, '3', 'Anime 3'],
      [3, '4', 'Anime 4']
    ]);
    expect(kitsu).not.toHaveBeenCalled();
  });

  it('removes the last rank', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1', '2'] }, kitsu);

    await removeFromTopAnime(db, 'user_1', '2');

    expect(await rankedIds('user_1')).toEqual(['1']);
  });

  it('is fine when the anime is not in the list', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1'] }, kitsu);

    await removeFromTopAnime(db, 'user_1', '99');

    expect(await rankedIds('user_1')).toEqual(['1']);
  });

  it("leaves other users' lists alone", async () => {
    await setTopAnime(db, 'user_2', { animeIds: ['1', '2'] }, kitsu);

    await removeFromTopAnime(db, 'user_1', '1');

    expect(await rankedIds('user_2')).toEqual(['1', '2']);
  });

  it('rejects an invalid anime id', async () => {
    const error = await errorFrom(removeFromTopAnime(db, 'user_1', '1 OR 1'));

    expect(error.status).toBe(400);
  });
});

describe('getPublicTopAnime', () => {
  it('returns the list for a username, whatever the letter case', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['2', '1'] }, kitsu);

    const items = await getPublicTopAnime(db, 'Spike');

    expect(items.map((item) => item.animeId)).toEqual(['2', '1']);
  });

  it('gives a 404 for an unknown username', async () => {
    const error = await errorFrom(getPublicTopAnime(db, 'nobody'));

    expect(error.status).toBe(404);
  });

  it('gives a 403 when the top 10 is private, whatever the watch list setting', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1'] }, kitsu);
    await updateProfile(db, 'user_1', { topAnimePublic: false });

    const error = await errorFrom(getPublicTopAnime(db, 'spike'));

    expect(error.status).toBe(403);
    expect(error.message).toBe('This top 10 is private');
  });

  it('is not hidden by a private watch list', async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1'] }, kitsu);
    await updateProfile(db, 'user_1', { watchListPublic: false });

    expect(await getPublicTopAnime(db, 'spike')).toHaveLength(1);
  });
});

describe('schema', () => {
  const row = { userId: 'user_1', animeId: '1', title: 'A' };

  it.each([0, 11])('rejects rank %i', async (rank) => {
    await expect(
      db.insert(topAnime).values({ ...row, rank })
    ).rejects.toThrow();
  });

  it('rejects the same anime twice for one user', async () => {
    await db.insert(topAnime).values({ ...row, rank: 1 });

    await expect(
      db.insert(topAnime).values({ ...row, rank: 2 })
    ).rejects.toThrow();
  });

  it('rejects two anime at one rank', async () => {
    await db.insert(topAnime).values({ ...row, rank: 1 });

    await expect(
      db.insert(topAnime).values({ ...row, animeId: '2', rank: 1 })
    ).rejects.toThrow();
  });

  it("deletes a user's top 10 with the user", async () => {
    await setTopAnime(db, 'user_1', { animeIds: ['1', '2'] }, kitsu);

    await db.delete(users).where(eq(users.id, 'user_1'));

    expect(await db.select().from(topAnime)).toEqual([]);
  });

  it('makes the top 10 public by default', async () => {
    const [user] = await db
      .select({ topAnimePublic: users.topAnimePublic })
      .from(users)
      .where(eq(users.id, 'user_2'));

    expect(user.topAnimePublic).toBe(true);
  });
});
