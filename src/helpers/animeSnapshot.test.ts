import { describe, expect, it } from 'vitest';
import { animeSnapshot } from './animeSnapshot';

const poster = {
  tiny: 'https://media.kitsu.app/p/tiny.jpg',
  small: 'https://media.kitsu.app/p/small.jpg',
  large: 'https://media.kitsu.app/p/large.jpg',
  original: 'https://media.kitsu.app/p/original.jpg',
  meta: {} as never
};

describe('animeSnapshot', () => {
  it('takes the canonical title, the large poster and the subtype', () => {
    expect(
      animeSnapshot({
        canonicalTitle: 'Cowboy Bebop',
        posterImage: poster,
        subtype: 'TV'
      })
    ).toEqual({
      title: 'Cowboy Bebop',
      posterUrl: 'https://media.kitsu.app/p/large.jpg',
      subtype: 'TV'
    });
  });

  it('falls back to a smaller poster, then to none', () => {
    const noLarge = { ...poster, large: undefined };
    expect(
      animeSnapshot({
        canonicalTitle: 'A',
        posterImage: noLarge,
        subtype: 'TV'
      }).posterUrl
    ).toBe('https://media.kitsu.app/p/small.jpg');
    expect(
      animeSnapshot({ canonicalTitle: 'A', posterImage: null, subtype: '' })
    ).toEqual({ title: 'A', posterUrl: null, subtype: null });
  });
});
