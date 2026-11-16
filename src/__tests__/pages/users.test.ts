// @vitest-environment node
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { GetServerSidePropsContext } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '@/server/db/client';
import { createTestDb } from '@/server/db/testDb';
import { ensureUser, updateProfile } from '@/server/users';
import { getServerSideProps } from '@/pages/users/[username]';

let db: Database;

vi.mock('@/server/db/client', () => ({ getDb: () => db }));

beforeEach(async () => {
  vi.stubEnv('SITE_URL', 'https://anime.example.com');
  db = await createTestDb();
  await ensureUser(db, 'user_1', async () => ({
    displayName: 'Spike Spiegel',
    avatarUrl: 'https://img.clerk.com/spike'
  }));
  await updateProfile(db, 'user_1', {
    username: 'spike',
    bio: 'Bounty hunter'
  });
});

async function render(username: string) {
  const res = { statusCode: 200 } as ServerResponse;
  const context = {
    params: { username },
    req: { headers: { host: 'localhost:3000' } } as IncomingMessage,
    res
  } as unknown as GetServerSidePropsContext;

  const result = await getServerSideProps(context);
  if (!('props' in result)) throw new Error('Expected props');
  return { props: await result.props, status: res.statusCode };
}

describe('getServerSideProps for /users/[username]', () => {
  it('puts the public profile in the query cache, with an absolute address', async () => {
    const { props, status } = await render('Spike');

    expect(status).toBe(200);
    expect(props).toMatchObject({
      username: 'Spike',
      found: true,
      url: 'https://anime.example.com/users/spike'
    });

    const [query] = props.dehydratedState!.queries;
    expect(query.queryKey).toEqual(['users', 'spike']);
    expect(query.state.data).toEqual({
      username: 'spike',
      displayName: 'Spike Spiegel',
      avatarUrl: 'https://img.clerk.com/spike',
      bio: 'Bounty hunter',
      createdAt: expect.any(String)
    });
    // Next.js only accepts props that survive JSON
    expect(JSON.parse(JSON.stringify(props))).toEqual(props);
  });

  it('shows the latest edits on the next request', async () => {
    await updateProfile(db, 'user_1', { bio: 'Retired' });

    const { props } = await render('spike');

    expect(props.dehydratedState!.queries[0].state.data).toMatchObject({
      bio: 'Retired'
    });
  });

  it('answers 404 for an unknown username, without profile data', async () => {
    const { props, status } = await render('nobody');

    expect(status).toBe(404);
    expect(props).toEqual({ username: 'nobody', found: false, url: '' });
  });
});
