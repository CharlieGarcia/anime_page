// @vitest-environment node
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from './db/client';
import { users, watchListItems } from './db/schema';
import { createTestDb } from './db/testDb';
import { HttpError } from './errors';
import { ensureUser, updateProfile } from './users';
import {
  addToWatchList,
  getPublicWatchList,
  getWatchList,
  removeFromWatchList,
  WATCH_LIST_MAX,
  type AnimeSnapshot,
  type LoadAnime
} from './watchList';

const bebop: AnimeSnapshot = {
  title: 'Cowboy Bebop',
  posterUrl: 'https://media.kitsu.app/anime/poster_images/1/large.jpg',
  subtype: 'TV'
};

// Stands in for Kitsu: every id is a known anime
const kitsu = vi.fn<LoadAnime>(async () => bebop);

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

// Puts rows straight into the table, with addedAt one minute apart (oldest first)
async function seed(userId: string, animeIds: string[]) {
  const start = Date.parse('2026-01-01T00:00:00Z');
  await db.insert(watchListItems).values(
    animeIds.map((animeId, index) => ({
      userId,
      animeId,
      title: `Anime ${animeId}`,
      addedAt: new Date(start + index * 60_000)
    }))
  );
}

describe('addToWatchList', () => {
  it('adds the anime with its Kitsu snapshot, as planned', async () => {
    const { item, created } = await addToWatchList(
      db,
      'user_1',
      { animeId: '1' },
      kitsu
    );

    expect(created).toBe(true);
    expect(kitsu).toHaveBeenCalledWith('1');
    expect(item).toEqual({
      animeId: '1',
      status: 'planned',
      ...bebop,
      addedAt: expect.any(Date)
    });
    expect(item).not.toHaveProperty('userId');
    expect(await getWatchList(db, 'user_1')).toEqual([item]);
  });

  it('takes the snapshot from Kitsu, not from the request', async () => {
    const { item } = await addToWatchList(
      db,
      'user_1',
      {
        animeId: '1',
        title: 'Fake title',
        posterUrl: 'https://evil',
        status: 'watched'
      },
      kitsu
    );

    expect(item).toMatchObject({ title: 'Cowboy Bebop', status: 'planned' });
    expect(item.posterUrl).toBe(bebop.posterUrl);
  });

  it('treats adding the same anime again as a no-op', async () => {
    const first = await addToWatchList(db, 'user_1', { animeId: '1' }, kitsu);
    const second = await addToWatchList(db, 'user_1', { animeId: '1' }, kitsu);

    expect(second).toEqual({ item: first.item, created: false });
    // The second add doesn't call Kitsu at all
    expect(kitsu).toHaveBeenCalledTimes(1);
    expect(await getWatchList(db, 'user_1')).toHaveLength(1);
  });

  it.each([
    ['missing', {}],
    ['a number', { animeId: 1 }],
    ['not digits', { animeId: 'abc' }],
    ['a path', { animeId: '1/../2' }],
    ['too long', { animeId: '12345678901' }],
    ['empty', { animeId: '' }]
  ])('rejects an anime id that is %s', async (_reason, body) => {
    const error = await errorFrom(addToWatchList(db, 'user_1', body, kitsu));

    expect(error.status).toBe(400);
    expect(error.fieldErrors?.animeId).toBeTruthy();
    expect(kitsu).not.toHaveBeenCalled();
  });

  it('rejects a body that is not an object', async () => {
    const error = await errorFrom(addToWatchList(db, 'user_1', null, kitsu));
    expect(error.status).toBe(400);
  });

  it('gives a 404 for an anime Kitsu does not have', async () => {
    const error = await errorFrom(
      addToWatchList(db, 'user_1', { animeId: '99999999' }, async () => null)
    );

    expect(error.status).toBe(404);
    expect(await getWatchList(db, 'user_1')).toEqual([]);
  });

  it('gives a 502 asking to retry when Kitsu cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = await errorFrom(
      addToWatchList(db, 'user_1', { animeId: '1' }, async () => {
        throw new TypeError('fetch failed');
      })
    );

    expect(error.status).toBe(502);
    expect(error.message).toMatch(/try again/i);
    expect(await getWatchList(db, 'user_1')).toEqual([]);
  });

  it(`stops at ${WATCH_LIST_MAX} items`, async () => {
    await seed(
      'user_1',
      Array.from({ length: WATCH_LIST_MAX }, (_, index) => String(index + 1))
    );

    const error = await errorFrom(
      addToWatchList(db, 'user_1', { animeId: '9999' }, kitsu)
    );

    expect(error.status).toBe(409);
    expect(kitsu).not.toHaveBeenCalled();
    expect(await getWatchList(db, 'user_1')).toHaveLength(WATCH_LIST_MAX);
  });

  it('still treats an anime already on a full list as a no-op', async () => {
    await seed(
      'user_1',
      Array.from({ length: WATCH_LIST_MAX }, (_, index) => String(index + 1))
    );

    const { created } = await addToWatchList(
      db,
      'user_1',
      { animeId: '1' },
      kitsu
    );
    expect(created).toBe(false);
  });

  it('counts the cap per user', async () => {
    await seed(
      'user_2',
      Array.from({ length: WATCH_LIST_MAX }, (_, index) => String(index + 1))
    );

    const { created } = await addToWatchList(
      db,
      'user_1',
      { animeId: '1' },
      kitsu
    );
    expect(created).toBe(true);
  });
});

describe('getWatchList', () => {
  it('returns the newest first, each with its status', async () => {
    await seed('user_1', ['10', '20', '30']);

    const items = await getWatchList(db, 'user_1');

    expect(items.map((item) => item.animeId)).toEqual(['30', '20', '10']);
    expect(items.every((item) => item.status === 'planned')).toBe(true);
  });

  it("only returns the user's own items", async () => {
    await seed('user_1', ['10']);
    await seed('user_2', ['20']);

    expect((await getWatchList(db, 'user_1')).map((i) => i.animeId)).toEqual([
      '10'
    ]);
    expect((await getWatchList(db, 'user_2')).map((i) => i.animeId)).toEqual([
      '20'
    ]);
  });
});

describe('removeFromWatchList', () => {
  it('removes the anime', async () => {
    await seed('user_1', ['10', '20']);

    await removeFromWatchList(db, 'user_1', '10');

    expect((await getWatchList(db, 'user_1')).map((i) => i.animeId)).toEqual([
      '20'
    ]);
  });

  it('is fine when the anime is not on the list', async () => {
    await expect(
      removeFromWatchList(db, 'user_1', '10')
    ).resolves.toBeUndefined();
  });

  it("leaves other users' lists alone", async () => {
    await seed('user_1', ['10']);
    await seed('user_2', ['10']);

    await removeFromWatchList(db, 'user_1', '10');

    expect(await getWatchList(db, 'user_1')).toEqual([]);
    expect(await getWatchList(db, 'user_2')).toHaveLength(1);
  });

  it('rejects an invalid anime id', async () => {
    const error = await errorFrom(removeFromWatchList(db, 'user_1', 'abc'));
    expect(error.status).toBe(400);
  });
});

describe('getPublicWatchList', () => {
  it('returns the list for a username, whatever the letter case', async () => {
    await seed('user_1', ['10', '20']);

    const items = await getPublicWatchList(db, 'Spike');

    expect(items.map((item) => item.animeId)).toEqual(['20', '10']);
    expect(items[0]).not.toHaveProperty('userId');
  });

  it('gives a 404 for an unknown username', async () => {
    const error = await errorFrom(getPublicWatchList(db, 'nobody'));
    expect(error.status).toBe(404);
  });

  it('gives a 403 when the list is private', async () => {
    await seed('user_1', ['10']);
    await updateProfile(db, 'user_1', { watchListPublic: false });

    const error = await errorFrom(getPublicWatchList(db, 'spike'));

    expect(error.status).toBe(403);
    expect(error.message).toBe('This watch list is private');
  });
});

describe('schema', () => {
  it("deletes a user's watch list with the user", async () => {
    await seed('user_1', ['10']);

    await db.delete(users).where(eq(users.id, 'user_1'));

    expect(await db.select().from(watchListItems)).toEqual([]);
  });

  it('rejects an item for a user that does not exist', async () => {
    await expect(seed('user_missing', ['10'])).rejects.toThrow();
  });
});
