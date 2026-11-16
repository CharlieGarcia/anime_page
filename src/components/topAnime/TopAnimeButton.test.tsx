import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TopAnimeButton from './TopAnimeButton';
import TopAnimeEditor from './TopAnimeEditor';
import {
  meQuery,
  myTopAnimeQuery,
  type TopAnimeAnime
} from '@/helpers/apiQueries';
import { Profile, TopAnimeItem } from '@/types';

// What Clerk reports; each test sets it
let auth: { isLoaded: boolean; isSignedIn: boolean };

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => auth,
  // Marks where the sign-in modal would open from
  SignInButton: ({
    children,
    mode
  }: {
    children: React.ReactNode;
    mode: string;
  }) => (
    <div data-testid="sign-in" data-mode={mode}>
      {children}
    </div>
  )
}));

const bebop: TopAnimeAnime = {
  animeId: '1',
  title: 'Cowboy Bebop',
  posterUrl: null,
  subtype: 'TV'
};

// The anime with ids 101, 102, ... at ranks 1, 2, ...
const ranked = (count: number): TopAnimeItem[] =>
  Array.from({ length: count }, (_, index) => ({
    rank: index + 1,
    animeId: String(101 + index),
    title: `Anime ${101 + index}`,
    posterUrl: null,
    subtype: 'TV'
  }));

const renumber = (items: TopAnimeItem[]) =>
  items.map((item, index) => ({ ...item, rank: index + 1 }));

// A fake server holding the user's top 10. GET always answers with what it holds now,
// so a refetch after a write sees that write.
let serverList: TopAnimeItem[];
type Reply = { status: number; body?: unknown };
// Overrides for one "METHOD path"; a promise holds the answer back
let overrides: Record<string, () => Reply | Promise<Reply>>;

function serve(method: string, path: string, body: unknown): Reply {
  if (method === 'GET' && path === '/api/me/top-anime') {
    return { status: 200, body: { items: serverList } };
  }
  if (method === 'POST' && path === '/api/me/top-anime') {
    const { animeId } = body as { animeId: string };
    if (serverList.some((item) => item.animeId === animeId)) {
      return { status: 200, body: { items: serverList } };
    }
    if (serverList.length >= 10) {
      return { status: 409, body: { error: 'Your top 10 is full' } };
    }
    serverList = renumber([
      ...serverList,
      { ...bebop, animeId, rank: 0, title: 'Cowboy Bebop (from Kitsu)' }
    ]);
    return { status: 201, body: { items: serverList } };
  }
  const remove = path.match(/^\/api\/me\/top-anime\/(\d+)$/);
  if (method === 'DELETE' && remove) {
    serverList = renumber(
      serverList.filter((item) => item.animeId !== remove[1])
    );
    return { status: 204 };
  }
  throw new Error(`Unexpected request ${method} ${path}`);
}

const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
  const method = init?.method ?? 'GET';
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  const override = overrides[`${method} ${path}`];
  const reply = override ? await override() : serve(method, path, body);
  return new Response(
    reply.body === undefined ? null : JSON.stringify(reply.body),
    { status: reply.status }
  );
});

const requests = () =>
  fetchMock.mock.calls.map(
    ([path, init]) => `${init?.method ?? 'GET'} ${path}`
  );

function renderWithClient(ui: React.ReactElement) {
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return queryClient;
}

// The button once the list has loaded and it can be clicked
async function enabledButton(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toHaveProperty('disabled', false));
  return button;
}

const cached = (queryClient: QueryClient) =>
  queryClient
    .getQueryData(myTopAnimeQuery().queryKey)
    ?.map((item) => `${item.rank}:${item.animeId}`);

beforeEach(() => {
  auth = { isLoaded: true, isSignedIn: true };
  serverList = [];
  overrides = {};
});

afterEach(() => {
  cleanup();
  fetchMock.mockClear();
  vi.unstubAllGlobals();
});

describe('TopAnimeButton', () => {
  it('waits, disabled, until Clerk knows who is signed in', () => {
    auth = { isLoaded: false, isSignedIn: false };
    renderWithClient(<TopAnimeButton anime={bebop} />);

    const button = screen.getByRole('button', { name: 'Add to top 10' });
    expect(button).toHaveProperty('disabled', true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('opens the sign-in modal for a signed-out visitor', () => {
    auth = { isLoaded: true, isSignedIn: false };
    renderWithClient(<TopAnimeButton anime={bebop} />);

    const button = screen.getByRole('button', { name: 'Add to top 10' });
    expect(button).toHaveProperty('disabled', false);
    expect(
      button.closest('[data-testid="sign-in"]')?.getAttribute('data-mode')
    ).toBe('modal');
    fireEvent.click(button);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stays disabled until the list has loaded', () => {
    overrides['GET /api/me/top-anime'] = () => new Promise<Reply>(() => {});
    renderWithClient(<TopAnimeButton anime={bebop} />);

    expect(
      screen.getByRole('button', { name: 'Add to top 10' })
    ).toHaveProperty('disabled', true);
  });

  it('shows the rank of an anime that is already in the top 10', async () => {
    serverList = renumber([...ranked(2), { ...bebop, rank: 0 }]);
    renderWithClient(<TopAnimeButton anime={bebop} />);

    const button = await enabledButton('#3 in your top 10');
    expect(button.getAttribute('title')).toBe('Remove from your top 10');
  });

  it('adds it last straight away, sending only the id, then refetches', async () => {
    serverList = ranked(2);
    let answer!: () => void;
    overrides['POST /api/me/top-anime'] = () =>
      new Promise<Reply>((resolve) => {
        answer = () => {
          delete overrides['POST /api/me/top-anime'];
          resolve(serve('POST', '/api/me/top-anime', { animeId: '1' }));
        };
      });
    const queryClient = renderWithClient(<TopAnimeButton anime={bebop} />);

    fireEvent.click(await enabledButton('Add to top 10'));

    // Last, at rank 3, before the server answers
    await waitFor(() =>
      expect(cached(queryClient)).toEqual(['1:101', '2:102', '3:1'])
    );
    expect(
      screen.getByRole('button', { name: '#3 in your top 10' })
    ).toBeTruthy();
    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'POST'
    );
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ animeId: '1' });

    // Then the list is refetched, and the server's snapshot replaces ours
    answer();
    await waitFor(() =>
      expect(
        requests().filter((request) => request === 'GET /api/me/top-anime')
      ).toHaveLength(2)
    );
    await waitFor(() =>
      expect(
        queryClient.getQueryData(myTopAnimeQuery().queryKey)?.[2].title
      ).toBe('Cowboy Bebop (from Kitsu)')
    );
    expect(await enabledButton('#3 in your top 10')).toBeTruthy();
  });

  it('removes it, and the anime ranked below move up one', async () => {
    serverList = renumber([
      ...ranked(1),
      { ...bebop, rank: 0 },
      ...ranked(3).slice(1)
    ]);
    let answer!: () => void;
    overrides['DELETE /api/me/top-anime/1'] = () =>
      new Promise<Reply>((resolve) => {
        answer = () =>
          resolve(serve('DELETE', '/api/me/top-anime/1', undefined));
      });
    const queryClient = renderWithClient(<TopAnimeButton anime={bebop} />);

    fireEvent.click(await enabledButton('#2 in your top 10'));

    // Before the server answers
    await waitFor(() =>
      expect(cached(queryClient)).toEqual(['1:101', '2:102', '3:103'])
    );
    expect(screen.getByRole('button', { name: 'Add to top 10' })).toBeTruthy();

    answer();
    await waitFor(() =>
      expect(
        requests().filter((request) => request === 'GET /api/me/top-anime')
      ).toHaveLength(2)
    );
    expect(requests()).toContain('DELETE /api/me/top-anime/1');
    expect(cached(queryClient)).toEqual(['1:101', '2:102', '3:103']);
    expect(await enabledButton('Add to top 10')).toBeTruthy();
  });

  it('is disabled with a link to the profile when the top 10 is full', async () => {
    serverList = ranked(10);
    renderWithClient(<TopAnimeButton anime={bebop} />);

    const button = await screen.findByRole('button', {
      name: 'Your top 10 is full'
    });
    expect(button).toHaveProperty('disabled', true);
    expect(
      screen
        .getByRole('link', { name: 'Make room on your profile' })
        .getAttribute('href')
    ).toBe('/profile');
  });

  it('still shows the rank of an anime in a full top 10', async () => {
    serverList = renumber([...ranked(9), { ...bebop, rank: 0 }]);
    renderWithClient(<TopAnimeButton anime={bebop} />);

    expect(await enabledButton('#10 in your top 10')).toBeTruthy();
    expect(
      screen.queryByRole('link', { name: 'Make room on your profile' })
    ).toBeNull();
  });

  it('takes the anime off again and says why when adding fails', async () => {
    serverList = ranked(2);
    overrides['POST /api/me/top-anime'] = () => ({
      status: 502,
      body: {
        error:
          "Couldn't reach Kitsu to look up this anime. Try again in a moment."
      }
    });
    const queryClient = renderWithClient(<TopAnimeButton anime={bebop} />);

    fireEvent.click(await enabledButton('Add to top 10'));

    expect(
      await screen.findByText(
        "Couldn't add Cowboy Bebop: Couldn't reach Kitsu to look up this anime. Try again in a moment."
      )
    ).toBeTruthy();
    await waitFor(() =>
      expect(cached(queryClient)).toEqual(['1:101', '2:102'])
    );
    expect(await enabledButton('Add to top 10')).toBeTruthy();
  });

  it('puts the anime back and says why when removing fails', async () => {
    serverList = renumber([{ ...bebop, rank: 0 }, ...ranked(1)]);
    overrides['DELETE /api/me/top-anime/1'] = () => ({
      status: 500,
      body: { error: 'Something went wrong' }
    });
    const queryClient = renderWithClient(<TopAnimeButton anime={bebop} />);

    fireEvent.click(await enabledButton('#1 in your top 10'));

    expect(
      await screen.findByText(
        "Couldn't remove Cowboy Bebop: Something went wrong"
      )
    ).toBeTruthy();
    await waitFor(() => expect(cached(queryClient)).toEqual(['1:1', '2:101']));
  });

  it('shows the added anime last in the profile top 10 straight away', async () => {
    serverList = ranked(2);
    // Held back, so what the list shows is the optimistic update
    overrides['POST /api/me/top-anime'] = () => new Promise<Reply>(() => {});
    const queryClient = renderWithClient(
      <>
        <TopAnimeButton anime={bebop} />
        <TopAnimeEditor />
      </>
    );
    queryClient.setQueryData(meQuery().queryKey, {
      topAnimePublic: true
    } as Profile);

    const list = await screen.findByRole('list');
    await waitFor(() =>
      expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    );
    fireEvent.click(await enabledButton('Add to top 10'));

    await waitFor(() =>
      expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    );
    const rows = within(list).getAllByRole('listitem');
    expect(within(rows[2]).getByRole('heading', { level: 3 }).textContent).toBe(
      'Cowboy Bebop'
    );
  });

  it('takes the removed anime off the profile top 10 and moves the rest up', async () => {
    serverList = renumber([
      ...ranked(1),
      { ...bebop, rank: 0 },
      ...ranked(3).slice(1)
    ]);
    const queryClient = renderWithClient(
      <>
        <TopAnimeButton anime={bebop} />
        <TopAnimeEditor />
      </>
    );
    queryClient.setQueryData(meQuery().queryKey, {
      topAnimePublic: true
    } as Profile);

    fireEvent.click(await enabledButton('#2 in your top 10'));

    const list = await screen.findByRole('list');
    await waitFor(() =>
      expect(
        within(list)
          .getAllByRole('heading', { level: 3 })
          .map((heading) => heading.textContent)
      ).toEqual(['Anime 101', 'Anime 102', 'Anime 103'])
    );
  });
});
