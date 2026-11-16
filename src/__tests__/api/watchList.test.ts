// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '@/server/db/client';
import type { User } from '@/server/db/schema';
import { createTestDb } from '@/server/db/testDb';
import { HttpError } from '@/server/errors';
import { ensureUser, getUser, updateProfile } from '@/server/users';
import { addToWatchList, getWatchList } from '@/server/watchList';
import ownList from '@/pages/api/me/watch-list';
import ownItem from '@/pages/api/me/watch-list/[animeId]';
import publicList from '@/pages/api/users/[username]/watch-list';

let db: Database;
// Who the request is signed in as; null when signed out
let signedIn: User | null;

vi.mock('@/server/db/client', () => ({ getDb: () => db }));
vi.mock('@/server/auth', () => ({
  requireUser: async () => {
    if (!signedIn) throw new HttpError(401, 'Not signed in');
    return signedIn;
  }
}));
vi.mock('@/server/kitsu', () => ({
  loadAnimeSnapshot: async () => ({
    title: 'Cowboy Bebop',
    posterUrl: null,
    subtype: 'TV'
  })
}));

const kitsu = async () => ({ title: 'Trigun', posterUrl: null, subtype: 'TV' });

async function call(
  handler: (req: NextApiRequest, res: NextApiResponse) => unknown,
  req: Partial<NextApiRequest>
) {
  const sent = { status: 0, body: undefined as unknown };
  const res = {
    setHeader: () => res,
    status: (code: number) => {
      sent.status = code;
      return res;
    },
    json: (body: unknown) => {
      sent.body = body;
      return res;
    },
    end: () => res
  };
  await handler(
    { query: {}, ...req } as NextApiRequest,
    res as unknown as NextApiResponse
  );
  return sent;
}

beforeEach(async () => {
  db = await createTestDb();
  await ensureUser(db, 'user_1', async () => ({
    displayName: 'Spike Spiegel',
    avatarUrl: null
  }));
  await ensureUser(db, 'user_2', async () => ({
    displayName: 'Faye Valentine',
    avatarUrl: null
  }));
  await updateProfile(db, 'user_2', { username: 'faye' });
  await addToWatchList(db, 'user_2', { animeId: '7' }, kitsu);
  signedIn = await getUser(db, 'user_1');
});

describe('/api/me/watch-list', () => {
  it('needs a signed-in user', async () => {
    signedIn = null;
    expect((await call(ownList, { method: 'GET' })).status).toBe(401);
    expect(
      (await call(ownList, { method: 'POST', body: { animeId: '1' } })).status
    ).toBe(401);
    expect(
      (await call(ownItem, { method: 'DELETE', query: { animeId: '7' } }))
        .status
    ).toBe(401);
  });

  it('adds with 201, then 200 for a duplicate, and lists the result', async () => {
    const first = await call(ownList, {
      method: 'POST',
      body: { animeId: '1' }
    });
    const again = await call(ownList, {
      method: 'POST',
      body: { animeId: '1' }
    });
    const list = await call(ownList, { method: 'GET' });

    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ animeId: '1', status: 'planned' });
    expect(again.status).toBe(200);
    expect(list.status).toBe(200);
    expect(list.body).toEqual({ items: [first.body] });
  });

  it("adds to the signed-in user's list, whatever user the request names", async () => {
    await call(ownList, {
      method: 'POST',
      body: { animeId: '1', userId: 'user_2' },
      query: { userId: 'user_2', username: 'faye' }
    });

    expect((await getWatchList(db, 'user_1')).map((i) => i.animeId)).toEqual([
      '1'
    ]);
    expect((await getWatchList(db, 'user_2')).map((i) => i.animeId)).toEqual([
      '7'
    ]);
  });

  it("deletes with 204 from the signed-in user's list only", async () => {
    const result = await call(ownItem, {
      method: 'DELETE',
      query: { animeId: '7', userId: 'user_2' }
    });

    expect(result.status).toBe(204);
    expect(await getWatchList(db, 'user_2')).toHaveLength(1);
  });
});

describe('/api/users/[username]/watch-list', () => {
  it('is read-only', async () => {
    for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
      expect((await call(publicList, { method })).status).toBe(405);
    }
  });

  it('returns a public list without sign-in', async () => {
    signedIn = null;
    const result = await call(publicList, {
      method: 'GET',
      query: { username: 'faye' }
    });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      items: [expect.objectContaining({ animeId: '7', title: 'Trigun' })]
    });
  });

  it('gives a 403 for a private list and a 404 for an unknown user', async () => {
    await updateProfile(db, 'user_2', { watchListPublic: false });

    const hidden = await call(publicList, {
      method: 'GET',
      query: { username: 'faye' }
    });
    const missing = await call(publicList, {
      method: 'GET',
      query: { username: 'nobody' }
    });

    expect(hidden).toEqual({
      status: 403,
      body: { error: 'This watch list is private' }
    });
    expect(missing.status).toBe(404);
  });
});
