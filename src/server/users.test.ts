// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from './db/client';
import { users } from './db/schema';
import { createTestDb } from './db/testDb';
import { HttpError } from './errors';
import {
  BIO_MAX,
  ensureUser,
  getUser,
  getUserByUsername,
  toPublicProfile,
  updateProfile
} from './users';

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

// Runs the update and returns the HttpError it is expected to throw
async function updateError(id: string, input: unknown): Promise<HttpError> {
  const error = await updateProfile(db, id, input).catch((e) => e);
  expect(error).toBeInstanceOf(HttpError);
  return error;
}

describe('updateProfile', () => {
  beforeEach(async () => {
    await ensureUser(db, 'user_1', async () => profile);
  });

  it('saves the edited fields and leaves the others alone', async () => {
    const updated = await updateProfile(db, 'user_1', {
      username: 'spike',
      bio: 'Bounty hunter'
    });

    expect(updated).toMatchObject({
      displayName: 'Spike Spiegel',
      username: 'spike',
      bio: 'Bounty hunter'
    });
    expect(await getUser(db, 'user_1')).toEqual(updated);
  });

  it('trims text and stores the username in lower case', async () => {
    const updated = await updateProfile(db, 'user_1', {
      displayName: '  Spike  ',
      username: '  Spike_1 ',
      bio: '  hi  '
    });

    expect(updated).toMatchObject({
      displayName: 'Spike',
      username: 'spike_1',
      bio: 'hi'
    });
  });

  it.each([
    ['too short', 'ab'],
    ['too long', 'a'.repeat(21)],
    ['a space', 'spike spiegel'],
    ['a symbol', 'spike!'],
    ['not a string', 42]
  ])('rejects a username with %s', async (_reason, username) => {
    const error = await updateError('user_1', { username });

    expect(error.status).toBe(400);
    expect(error.fieldErrors?.username).toBeTruthy();
    expect((await getUser(db, 'user_1'))?.username).toBeNull();
  });

  it('reports every invalid field at once', async () => {
    const error = await updateError('user_1', {
      displayName: '   ',
      bio: 'x'.repeat(BIO_MAX + 1)
    });

    expect(error.status).toBe(400);
    expect(Object.keys(error.fieldErrors ?? {}).sort()).toEqual([
      'bio',
      'displayName'
    ]);
  });

  it('rejects an empty update', async () => {
    expect((await updateError('user_1', {})).status).toBe(400);
    expect((await updateError('user_1', null)).status).toBe(400);
  });

  it('ignores fields that are not editable', async () => {
    const updated = await updateProfile(db, 'user_1', {
      bio: 'ok',
      id: 'user_hacked',
      avatarUrl: 'https://evil'
    });

    expect(updated.id).toBe('user_1');
    expect(updated.avatarUrl).toBe('https://img/spike');
  });

  it('rejects a username another user has, whatever the letter case', async () => {
    await ensureUser(db, 'user_2', async () => profile);
    await updateProfile(db, 'user_2', { username: 'faye' });

    const error = await updateError('user_1', { username: 'FAYE' });

    expect(error.status).toBe(409);
    expect(error.fieldErrors).toEqual({ username: 'That username is taken' });
  });

  it('lets a user save their own username again', async () => {
    await updateProfile(db, 'user_1', { username: 'spike' });

    const updated = await updateProfile(db, 'user_1', {
      username: 'spike',
      bio: 'again'
    });

    expect(updated.bio).toBe('again');
  });

  it('reports an unknown user', async () => {
    expect((await updateError('user_missing', { bio: 'x' })).status).toBe(404);
  });
});

describe('getUserByUsername', () => {
  it('finds a user whatever the letter case, and null otherwise', async () => {
    await ensureUser(db, 'user_1', async () => profile);
    await updateProfile(db, 'user_1', { username: 'spike' });

    expect((await getUserByUsername(db, 'Spike'))?.id).toBe('user_1');
    expect(await getUserByUsername(db, 'nobody')).toBeNull();
  });
});

describe('toPublicProfile', () => {
  it('leaves out the user id', async () => {
    const user = await ensureUser(db, 'user_1', async () => profile);

    expect(Object.keys(toPublicProfile(user)).sort()).toEqual([
      'avatarUrl',
      'bio',
      'createdAt',
      'displayName',
      'username'
    ]);
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
