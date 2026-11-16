// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KitsuRequestError } from '@/helpers/request';
import { loadAnimeSnapshot, loadAnimeSnapshots } from './kitsu';

const anime = (id: string, title: string) => ({
  id,
  attributes: {
    canonicalTitle: title,
    posterImage: { large: `https://media.kitsu.app/${id}.jpg`, original: '' },
    subtype: 'TV'
  }
});

function stubKitsu(data: unknown[], status = 200) {
  const fetchMock = vi.fn<
    (url: string, init?: RequestInit) => Promise<Response>
  >(async () => new Response(JSON.stringify({ data }), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadAnimeSnapshots', () => {
  it('asks for every id in one request and matches the results by id', async () => {
    // Kitsu answers sorted by id, not in the order asked for
    const fetchMock = stubKitsu([anime('1', 'Cowboy Bebop'), anime('7', 'B')]);

    const snapshots = await loadAnimeSnapshots(['7', '1', '404']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const query = new URL(url).searchParams;
    expect(new URL(url).pathname).toMatch(/\/anime$/);
    expect(query.get('filter[id]')).toBe('7,1,404');
    expect(query.get('page[limit]')).toBe('10');
    expect(query.get('fields[anime]')).toBe(
      'canonicalTitle,posterImage,subtype'
    );
    expect(init?.signal).toBeInstanceOf(AbortSignal);

    expect(snapshots.get('1')).toEqual({
      title: 'Cowboy Bebop',
      posterUrl: 'https://media.kitsu.app/1.jpg',
      subtype: 'TV'
    });
    expect(snapshots.get('7')?.title).toBe('B');
    expect(snapshots.has('404')).toBe(false);
  });

  it('makes no request for no ids', async () => {
    const fetchMock = stubKitsu([]);

    expect((await loadAnimeSnapshots([])).size).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses more ids than one page holds', async () => {
    stubKitsu([]);

    await expect(
      loadAnimeSnapshots(Array.from({ length: 11 }, (_, i) => String(i)))
    ).rejects.toThrow();
  });

  it('throws when Kitsu fails', async () => {
    stubKitsu([], 503);

    await expect(loadAnimeSnapshots(['1'])).rejects.toBeInstanceOf(
      KitsuRequestError
    );
  });
});

describe('loadAnimeSnapshot', () => {
  it('returns the one snapshot, or null for an unknown id', async () => {
    stubKitsu([anime('1', 'Cowboy Bebop')]);
    expect((await loadAnimeSnapshot('1'))?.title).toBe('Cowboy Bebop');

    stubKitsu([]);
    expect(await loadAnimeSnapshot('404')).toBeNull();
  });
});
