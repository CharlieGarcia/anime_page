import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, skipToken } from '@tanstack/react-query';
import {
  EPISODES_PER_PAGE,
  RELATED_PER_PAGE,
  animeEpisodesQuery,
  relatedAnimeQuery,
  searchAnimeQuery
} from './queries';
import { ITEMS_PER_PAGE } from '@/constants';
import { SearchFieldsType } from '@/types';

const emptyFields: SearchFieldsType = {
  seasonYear: '',
  sort: '',
  status: '',
  season: '',
  categories: '',
  subtype: '',
  ageRating: ''
};

const fetchMock = vi.fn();

function respondWith(body: unknown) {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(body), { status: 200 })
  );
}

// The query string of the only request made to Kitsu
function requestedUrl() {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  return new URL(fetchMock.mock.calls[0][0]);
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchAnimeQuery', () => {
  it('sends filters as filter[...] params and sort as sort', async () => {
    respondWith({ data: [], meta: { count: 0 } });

    await makeClient().fetchQuery(
      searchAnimeQuery({
        fields: {
          ...emptyFields,
          seasonYear: '2024',
          status: 'current',
          categories: 'action',
          sort: 'popularityRank'
        },
        page: 1
      })
    );

    const url = requestedUrl();
    expect(url.pathname.endsWith('/anime')).toBe(true);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      'page[offset]': '0',
      'page[limit]': String(ITEMS_PER_PAGE),
      'filter[seasonYear]': '2024',
      'filter[status]': 'current',
      'filter[categories]': 'action',
      sort: 'popularityRank'
    });
  });

  it('leaves out empty fields', async () => {
    respondWith({ data: [], meta: { count: 0 } });

    await makeClient().fetchQuery(
      searchAnimeQuery({ fields: emptyFields, page: 1 })
    );

    expect([...requestedUrl().searchParams.keys()]).toEqual([
      'page[offset]',
      'page[limit]'
    ]);
  });

  it.each([
    [1, 0],
    [2, ITEMS_PER_PAGE],
    [5, 4 * ITEMS_PER_PAGE]
  ])('requests page %i with offset %i', async (page, offset) => {
    respondWith({ data: [], meta: { count: 0 } });

    await makeClient().fetchQuery(
      searchAnimeQuery({ fields: emptyFields, page })
    );

    expect(requestedUrl().searchParams.get('page[offset]')).toBe(
      String(offset)
    );
  });

  it('returns the list and the total count', async () => {
    respondWith({ data: [{ id: '1' }, { id: '2' }], meta: { count: 40 } });

    const result = await makeClient().fetchQuery(
      searchAnimeQuery({ fields: emptyFields, page: 1 })
    );

    expect(result).toEqual({
      animeList: [{ id: '1' }, { id: '2' }],
      count: 40
    });
  });

  it('does not fetch until a search has been submitted', () => {
    expect(searchAnimeQuery(null).queryFn).toBe(skipToken);
  });
});

type Page = { items: never[]; total: number };

const page = (total: number): Page => ({ items: [], total });

// Arguments TanStack Query passes to getNextPageParam after loading `pages`
function pagingArgs(pages: Page[], perPage: number) {
  return [
    pages[pages.length - 1],
    pages,
    (pages.length - 1) * perPage,
    pages.map((_page, index) => index * perPage)
  ] as const;
}

describe.each([
  {
    name: 'animeEpisodesQuery',
    perPage: EPISODES_PER_PAGE,
    initialOffset: animeEpisodesQuery('1').initialPageParam,
    nextOffset: (pages: Page[]) =>
      animeEpisodesQuery('1').getNextPageParam(
        ...pagingArgs(pages, EPISODES_PER_PAGE)
      ),
    fetchFrom: (offset: number) =>
      makeClient().fetchInfiniteQuery({
        ...animeEpisodesQuery('1'),
        initialPageParam: offset
      })
  },
  {
    name: 'relatedAnimeQuery',
    perPage: RELATED_PER_PAGE,
    initialOffset: relatedAnimeQuery('action').initialPageParam,
    nextOffset: (pages: Page[]) =>
      relatedAnimeQuery('action').getNextPageParam(
        ...pagingArgs(pages, RELATED_PER_PAGE)
      ),
    fetchFrom: (offset: number) =>
      makeClient().fetchInfiniteQuery({
        ...relatedAnimeQuery('action'),
        initialPageParam: offset
      })
  }
])('$name paging', ({ perPage, initialOffset, nextOffset, fetchFrom }) => {
  it('starts at offset 0', () => {
    expect(initialOffset).toBe(0);
  });

  it('asks for the next offset while items remain', () => {
    const total = perPage * 2 + 1;

    expect(nextOffset([page(total)])).toBe(perPage);
    expect(nextOffset([page(total), page(total)])).toBe(perPage * 2);
  });

  it('stops once every item has been loaded', () => {
    expect(nextOffset([page(perPage)])).toBeUndefined();
    expect(nextOffset([page(perPage + 1), page(perPage + 1)])).toBeUndefined();
    expect(nextOffset([page(0)])).toBeUndefined();
  });

  it('sends the offset and page size to Kitsu', async () => {
    respondWith({ data: [], meta: { count: 0 } });

    await fetchFrom(perPage);

    const params = requestedUrl().searchParams;
    expect(params.get('page[offset]')).toBe(String(perPage));
    expect(params.get('page[limit]')).toBe(String(perPage));
  });
});
