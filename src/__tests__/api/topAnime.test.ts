// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '@/server/db/client';
import type { User } from '@/server/db/schema';
import { createTestDb } from '@/server/db/testDb';
import { HttpError } from '@/server/errors';
import { getTopAnime, setTopAnime } from '@/server/topAnime';
import { ensureUser, getUser, updateProfile } from '@/server/users';
import me from '@/pages/api/me';
import ownList from '@/pages/api/me/top-anime';
import ownItem from '@/pages/api/me/top-anime/[animeId]';
import publicList from '@/pages/api/users/[username]/top-anime';
import publicProfile from '@/pages/api/users/[username]';

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
  loadAnimeSnapshots: async (animeIds: string[]) =>
    new Map(
      animeIds.map((animeId) => [
        animeId,
        { title: `Anime ${animeId}`, posterUrl: null, subtype: 'TV' }
      ])
    )
}));

const kitsu = async (animeIds: string[]) =>
  new Map(
    animeIds.map((animeId) => [
      animeId,
      { title: 'Trigun', posterUrl: null, subtype: 'TV' }
    ])
  );

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

const animeIdsOf = async (userId: string) =>
  (await getTopAnime(db, userId)).map((item) => item.animeId);

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
  await setTopAnime(db, 'user_2', { animeIds: ['7', '8'] }, kitsu);
  signedIn = await getUser(db, 'user_1');
});

describe('/api/me/top-anime', () => {
  it('needs a signed-in user', async () => {
    signedIn = null;
    expect((await call(ownList, { method: 'GET' })).status).toBe(401);
    expect(
      (await call(ownList, { method: 'PUT', body: { animeIds: ['1'] } })).status
    ).toBe(401);
    expect(
      (await call(ownList, { method: 'POST', body: { animeId: '1' } })).status
    ).toBe(401);
    expect(
      (await call(ownItem, { method: 'DELETE', query: { animeId: '7' } }))
        .status
    ).toBe(401);
  });

  it('saves with PUT and lists the result in rank order', async () => {
    const saved = await call(ownList, {
      method: 'PUT',
      body: { animeIds: ['3', '1', '2'] }
    });
    const list = await call(ownList, { method: 'GET' });

    expect(saved.status).toBe(200);
    expect(saved.body).toEqual({
      items: [
        {
          rank: 1,
          animeId: '3',
          title: 'Anime 3',
          posterUrl: null,
          subtype: 'TV'
        },
        expect.objectContaining({ rank: 2, animeId: '1' }),
        expect.objectContaining({ rank: 3, animeId: '2' })
      ]
    });
    expect(list).toEqual({ status: 200, body: saved.body });
  });

  it('gives a 400 with a field error for an invalid PUT', async () => {
    const result = await call(ownList, {
      method: 'PUT',
      body: { animeIds: ['1', '1'] }
    });

    expect(result).toEqual({
      status: 400,
      body: {
        error: 'Each anime can appear only once in your top 10',
        fieldErrors: {
          animeIds: 'Each anime can appear only once in your top 10'
        }
      }
    });
  });

  it('adds with 201, then 200 for a duplicate, returning the whole list', async () => {
    const first = await call(ownList, {
      method: 'POST',
      body: { animeId: '1' }
    });
    const second = await call(ownList, {
      method: 'POST',
      body: { animeId: '2' }
    });
    const again = await call(ownList, {
      method: 'POST',
      body: { animeId: '1' }
    });

    expect(first.status).toBe(201);
    expect(first.body).toEqual({
      items: [expect.objectContaining({ rank: 1, animeId: '1' })]
    });
    expect(second.status).toBe(201);
    expect(again.status).toBe(200);
    expect(again.body).toEqual(second.body);
  });

  it('gives a 409 when the list is full', async () => {
    await call(ownList, {
      method: 'PUT',
      body: { animeIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] }
    });

    const result = await call(ownList, {
      method: 'POST',
      body: { animeId: '11' }
    });

    expect(result).toEqual({
      status: 409,
      body: { error: 'Your top 10 is full' }
    });
  });

  it('deletes with 204 and moves the rest up', async () => {
    await call(ownList, { method: 'PUT', body: { animeIds: ['1', '2', '3'] } });

    const result = await call(ownItem, {
      method: 'DELETE',
      query: { animeId: '1' }
    });
    const missing = await call(ownItem, {
      method: 'DELETE',
      query: { animeId: '99' }
    });

    expect(result.status).toBe(204);
    expect(missing.status).toBe(204);
    const list = await call(ownList, { method: 'GET' });
    expect(list.body).toEqual({
      items: [
        expect.objectContaining({ rank: 1, animeId: '2' }),
        expect.objectContaining({ rank: 2, animeId: '3' })
      ]
    });
  });

  it('rejects other methods', async () => {
    expect((await call(ownList, { method: 'PATCH' })).status).toBe(405);
    expect((await call(ownItem, { method: 'GET' })).status).toBe(405);
  });
});

describe("no route changes another user's top 10", () => {
  const otherUser = { userId: 'user_2', username: 'faye' };

  it("PUT saves the signed-in user's list, whatever user the request names", async () => {
    await call(ownList, {
      method: 'PUT',
      body: { animeIds: ['1'], ...otherUser },
      query: otherUser
    });

    expect(await animeIdsOf('user_1')).toEqual(['1']);
    expect(await animeIdsOf('user_2')).toEqual(['7', '8']);
  });

  it("POST adds to the signed-in user's list, whatever user the request names", async () => {
    await call(ownList, {
      method: 'POST',
      body: { animeId: '1', ...otherUser },
      query: otherUser
    });

    expect(await animeIdsOf('user_1')).toEqual(['1']);
    expect(await animeIdsOf('user_2')).toEqual(['7', '8']);
  });

  it("DELETE removes from the signed-in user's list only", async () => {
    const result = await call(ownItem, {
      method: 'DELETE',
      query: { animeId: '7', ...otherUser }
    });

    expect(result.status).toBe(204);
    expect(await animeIdsOf('user_2')).toEqual(['7', '8']);
  });

  it('the public route is read-only', async () => {
    for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
      const result = await call(publicList, {
        method,
        query: { username: 'faye' },
        body: { animeIds: [], animeId: '7' }
      });
      expect(result.status).toBe(405);
    }
    expect(await animeIdsOf('user_2')).toEqual(['7', '8']);
  });
});

describe('/api/users/[username]/top-anime', () => {
  it('returns a public top 10 without sign-in', async () => {
    signedIn = null;
    const result = await call(publicList, {
      method: 'GET',
      query: { username: 'faye' }
    });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      items: [
        expect.objectContaining({ rank: 1, animeId: '7', title: 'Trigun' }),
        expect.objectContaining({ rank: 2, animeId: '8' })
      ]
    });
  });

  it('gives a 403 for a private top 10 and a 404 for an unknown user', async () => {
    await updateProfile(db, 'user_2', { topAnimePublic: false });

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
      body: { error: 'This top 10 is private' }
    });
    expect(missing.status).toBe(404);
  });
});

describe('topAnimePublic on the profile routes', () => {
  it('PATCH /api/me sets it and the public profile shows it', async () => {
    signedIn = await getUser(db, 'user_2');

    const patched = await call(me, {
      method: 'PATCH',
      body: { topAnimePublic: false }
    });
    const profile = await call(publicProfile, {
      method: 'GET',
      query: { username: 'faye' }
    });

    expect(patched.status).toBe(200);
    expect(patched.body).toMatchObject({
      id: 'user_2',
      topAnimePublic: false,
      watchListPublic: true
    });
    expect(profile.body).toMatchObject({ topAnimePublic: false });
  });
});
