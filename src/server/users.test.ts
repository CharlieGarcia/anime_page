// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from './db/client';
import { users } from './db/schema';
import { createTestDb } from './db/testDb';
import { ensureUser, getUser } from './users';

const profile = {
  displayName: 'Spike Spiegel',
  avatarUrl: 'https://img/spike'
};

let db: Database;

beforeEach(async () => {
  db = await createTestDb();
});

describe('getUser', () => {
  it('returns null for an unknown id', async () => {
    expect(await getUser(db, 'user_missing')).toBeNull();
  });
});

describe('ensureUser', () => {
  it('creates the row on first use, with the loaded profile and defaults', async () => {
    const user = await ensureUser(db, 'user_1', async () => profile);

    expect(user).toMatchObject({
      id: 'user_1',
      displayName: 'Spike Spiegel',
      avatarUrl: 'https://img/spike',
      username: null,
      bio: ''
    });
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(await getUser(db, 'user_1')).toEqual(user);
  });

  it('returns the existing row without loading the profile again', async () => {
    const first = await ensureUser(db, 'user_1', async () => profile);
    const loadProfile = vi.fn(async () => ({
      displayName: 'Someone else',
      avatarUrl: null
    }));

    const second = await ensureUser(db, 'user_1', loadProfile);

    expect(second).toEqual(first);
    expect(loadProfile).not.toHaveBeenCalled();
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it('keeps the first row when two first requests race', async () => {
    const [a, b] = await Promise.all([
      ensureUser(db, 'user_1', async () => profile),
      ensureUser(db, 'user_1', async () => ({
        ...profile,
        displayName: 'Late arrival'
      }))
    ]);

    expect(a).toEqual(b);
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it('keeps users apart', async () => {
    await ensureUser(db, 'user_1', async () => profile);
    await ensureUser(db, 'user_2', async () => ({
      displayName: 'Faye Valentine',
      avatarUrl: null
    }));

    expect((await getUser(db, 'user_2'))?.displayName).toBe('Faye Valentine');
    expect(await db.select().from(users)).toHaveLength(2);
  });
});

describe('schema', () => {
  it('rejects a duplicate username', async () => {
    await db
      .insert(users)
      .values({ id: 'user_1', displayName: 'A', username: 'spike' });

    await expect(
      db
        .insert(users)
        .values({ id: 'user_2', displayName: 'B', username: 'spike' })
    ).rejects.toThrow();
  });
});
