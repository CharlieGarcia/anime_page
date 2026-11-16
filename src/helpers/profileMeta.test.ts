import { describe, expect, it } from 'vitest';
import { profileMeta } from './profileMeta';

const profile = {
  username: 'spike',
  displayName: 'Spike Spiegel',
  avatarUrl: 'https://img.clerk.com/spike',
  bio: 'Bounty hunter',
  createdAt: '2026-01-01T00:00:00.000Z'
};

describe('profileMeta', () => {
  it('uses the name, username, bio and avatar', () => {
    expect(profileMeta(profile)).toEqual({
      title: 'Spike Spiegel (@spike)',
      description: 'Bounty hunter',
      image: 'https://img.clerk.com/spike'
    });
  });

  it('falls back to a short description when the bio is empty', () => {
    expect(profileMeta({ ...profile, bio: '  ' }).description).toBe(
      "Spike Spiegel's profile on My Anime."
    );
  });

  it('puts a multi-line bio on one line', () => {
    expect(
      profileMeta({ ...profile, bio: 'Line one\n\nLine two' }).description
    ).toBe('Line one Line two');
  });

  it('shortens a long bio', () => {
    const { description } = profileMeta({ ...profile, bio: 'a'.repeat(300) });

    expect(description).toHaveLength(200);
    expect(description.endsWith('…')).toBe(true);
  });

  it('has no image without an avatar', () => {
    expect(profileMeta({ ...profile, avatarUrl: null }).image).toBeNull();
  });
});
