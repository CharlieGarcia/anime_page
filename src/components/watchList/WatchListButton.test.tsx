import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OwnWatchList from './OwnWatchList';
import WatchListButton from './WatchListButton';
import {
  meQuery,
  myWatchListQuery,
  type WatchListAnime
} from '@/helpers/apiQueries';
import { Profile, WatchListItem } from '@/types';

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

const bebop: WatchListAnime = {
  animeId: '1',
  title: 'Cowboy Bebop',
  posterUrl: null,
  subtype: 'TV'
};
const trigun: WatchListItem = {
  animeId: '6',
  title: 'Trigun',
  posterUrl: null,
  subtype: 'TV',
  status: 'planned',
  addedAt: '2026-11-01T00:00:00.000Z'
};
const savedBebop: WatchListItem = {
  ...bebop,
  status: 'planned',
  addedAt: '2026-11-02T00:00:00.000Z'
};

type Reply = { status: number; body?: unknown } | Promise<Response>;
// Answers by "METHOD path"; anything else fails the test
let routes: Record<string, () => Reply>;
const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
  const reply = routes[`${init?.method ?? 'GET'} ${path}`];
  if (!reply) throw new Error(`Unexpected request ${init?.method} ${path}`);
  const result = reply();
  if (result instanceof Promise) return result;
  return new Response(
    result.body === undefined ? null : JSON.stringify(result.body),
    { status: result.status }
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
async function enabledButton(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toHaveProperty('disabled', false));
  return button;
}

const cachedIds = (queryClient: QueryClient) =>
  queryClient
    .getQueryData(myWatchListQuery().queryKey)
    ?.map((item) => item.animeId);

beforeEach(() => {
  auth = { isLoaded: true, isSignedIn: true };
  routes = {};
});

afterEach(() => {
  cleanup();
  fetchMock.mockClear();
  vi.unstubAllGlobals();
});

describe('WatchListButton', () => {
  it('waits, disabled, until Clerk knows who is signed in', () => {
    auth = { isLoaded: false, isSignedIn: false };
    renderWithClient(<WatchListButton anime={bebop} />);

    const button = screen.getByRole('button', { name: 'Add to watch list' });
    expect(button).toHaveProperty('disabled', true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('opens the sign-in modal for a signed-out visitor', () => {
    auth = { isLoaded: true, isSignedIn: false };
    renderWithClient(<WatchListButton anime={bebop} />);

    const button = screen.getByRole('button', { name: 'Add to watch list' });
    expect(button).toHaveProperty('disabled', false);
    expect(
      button.closest('[data-testid="sign-in"]')?.getAttribute('data-mode')
    ).toBe('modal');
    fireEvent.click(button);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stays disabled until the list has loaded', () => {
    routes = {
      'GET /api/me/watch-list': () => new Promise<Response>(() => {})
    };
    renderWithClient(<WatchListButton anime={bebop} />);

    expect(
      screen.getByRole('button', { name: 'Add to watch list' })
    ).toHaveProperty('disabled', true);
  });

  it('offers to remove an anime that is already on the list', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [savedBebop] }
      })
    };
    renderWithClient(<WatchListButton anime={bebop} />);

    expect(
      await screen.findByRole('button', { name: 'Remove from watch list' })
    ).toBeTruthy();
  });

  it('adds straight away, sending only the id', async () => {
    let answer!: (response: Response) => void;
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [trigun] }
      }),
      'POST /api/me/watch-list': () =>
        new Promise<Response>((resolve) => (answer = resolve))
    };
    const queryClient = renderWithClient(<WatchListButton anime={bebop} />);

    fireEvent.click(await enabledButton('Add to watch list'));

    // On the list, at the top, before the server answers
    await waitFor(() => expect(cachedIds(queryClient)).toEqual(['1', '6']));
    expect(
      screen.getByRole('button', { name: 'Remove from watch list' })
    ).toBeTruthy();
    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'POST'
    );
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ animeId: '1' });

    // Then the list is refetched from the server
    routes['GET /api/me/watch-list'] = () => ({
      status: 200,
      body: { items: [savedBebop, trigun] }
    });
    answer(new Response(JSON.stringify(savedBebop), { status: 201 }));
    await waitFor(() =>
      expect(
        requests().filter((request) => request === 'GET /api/me/watch-list')
      ).toHaveLength(2)
    );
    expect(
      await screen.findByRole('button', { name: 'Remove from watch list' })
    ).toHaveProperty('disabled', false);
  });

  it('removes an anime that is on the list', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [savedBebop, trigun] }
      }),
      'DELETE /api/me/watch-list/1': () => {
        // The server's list no longer has it
        routes['GET /api/me/watch-list'] = () => ({
          status: 200,
          body: { items: [trigun] }
        });
        return { status: 204 };
      }
    };
    const queryClient = renderWithClient(<WatchListButton anime={bebop} />);

    fireEvent.click(await enabledButton('Remove from watch list'));

    await waitFor(() => expect(cachedIds(queryClient)).toEqual(['6']));
    expect(requests()).toContain('DELETE /api/me/watch-list/1');
    expect(
      screen.getByRole('button', { name: 'Add to watch list' })
    ).toBeTruthy();
  });

  it('takes the anime off again and says why when adding fails', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [trigun] }
      }),
      'POST /api/me/watch-list': () => ({
        status: 409,
        body: {
          error:
            'Your watch list is full (500 anime). Remove one to add another.'
        }
      })
    };
    const queryClient = renderWithClient(<WatchListButton anime={bebop} />);

    fireEvent.click(await enabledButton('Add to watch list'));

    expect(
      await screen.findByText(
        "Couldn't add Cowboy Bebop: Your watch list is full (500 anime). Remove one to add another."
      )
    ).toBeTruthy();
    await waitFor(() => expect(cachedIds(queryClient)).toEqual(['6']));
    expect(
      screen.getByRole('button', { name: 'Add to watch list' })
    ).toBeTruthy();
  });

  it('shows the anime on the profile list as soon as it is added', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [trigun] }
      }),
      'POST /api/me/watch-list': () => new Promise<Response>(() => {})
    };
    const queryClient = renderWithClient(
      <>
        <WatchListButton anime={bebop} />
        <OwnWatchList />
      </>
    );
    queryClient.setQueryData(meQuery().queryKey, {
      watchListPublic: true
    } as Profile);

    expect(await screen.findByText('Trigun')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Add to watch list' }));

    expect(await screen.findByText('Cowboy Bebop')).toBeTruthy();
  });
});
