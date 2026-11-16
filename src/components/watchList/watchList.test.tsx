import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OwnWatchList from './OwnWatchList';
import PublicWatchList from './PublicWatchList';
import WatchListGrid from './WatchListGrid';
import WatchListPrivacySwitch from './WatchListPrivacySwitch';
import { meQuery, myWatchListQuery } from '@/helpers/apiQueries';
import { Profile, WatchListItem } from '@/types';

const bebop: WatchListItem = {
  animeId: '1',
  status: 'planned',
  title: 'Cowboy Bebop',
  posterUrl: 'https://media.kitsu.app/anime/poster_images/1/large.jpg',
  subtype: 'TV',
  addedAt: '2026-11-02T00:00:00.000Z'
};
const trigun: WatchListItem = {
  animeId: '6',
  status: 'planned',
  title: 'Trigun',
  posterUrl: null,
  subtype: null,
  addedAt: '2026-11-01T00:00:00.000Z'
};

const me: Profile = {
  id: 'user_1',
  username: 'spike',
  displayName: 'Spike Spiegel',
  avatarUrl: null,
  bio: '',
  watchListPublic: true,
  topAnimePublic: true,
  createdAt: '2026-10-11T00:00:00.000Z'
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

function renderWithClient(ui: React.ReactElement, cached: Profile = me) {
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } }
  });
  queryClient.setQueryData(meQuery().queryKey, cached);
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return queryClient;
}

const requests = () =>
  fetchMock.mock.calls.map(
    ([path, init]) => `${init?.method ?? 'GET'} ${path}`
  );

afterEach(() => {
  cleanup();
  fetchMock.mockClear();
  vi.unstubAllGlobals();
});

describe('WatchListGrid', () => {
  it('shows each item as a card linking to its details page', () => {
    render(<WatchListGrid items={[bebop, trigun]} emptyMessage="Empty" />);

    const cards = screen.getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByRole('link').getAttribute('href')).toBe(
      '/details/1'
    );
    expect(within(cards[0]).getByRole('heading').textContent).toBe(
      'Cowboy Bebop'
    );
    expect(within(cards[0]).getByText('TV')).toBeTruthy();
    expect(within(cards[1]).getByRole('link').getAttribute('href')).toBe(
      '/details/6'
    );
    expect(screen.queryByText('Empty')).toBeNull();
  });

  it('shows the empty message when there are no items', () => {
    render(<WatchListGrid items={[]} emptyMessage="Nothing here" />);

    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('puts the action under each card, outside its link', () => {
    render(
      <WatchListGrid
        items={[bebop]}
        emptyMessage="Empty"
        renderAction={(item) => <button>Do {item.title}</button>}
      />
    );

    const button = screen.getByRole('button', { name: 'Do Cowboy Bebop' });
    expect(button.closest('a')).toBeNull();
  });
});

describe('OwnWatchList', () => {
  it('shows the list with a Remove button per card', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [bebop, trigun] }
      })
    };
    renderWithClient(<OwnWatchList />);

    expect(await screen.findByText('Cowboy Bebop')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(2);
  });

  it('removes an item straight away, before the server answers', async () => {
    let answer!: (response: Response) => void;
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [bebop, trigun] }
      }),
      'DELETE /api/me/watch-list/1': () =>
        new Promise<Response>((resolve) => (answer = resolve))
    };
    renderWithClient(<OwnWatchList />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Remove Cowboy Bebop from watch list'
      })
    );

    await waitFor(() => expect(screen.queryByText('Cowboy Bebop')).toBeNull());
    expect(screen.getByText('Trigun')).toBeTruthy();
    expect(requests()).toContain('DELETE /api/me/watch-list/1');

    // The refetch after the delete returns the list without it
    routes['GET /api/me/watch-list'] = () => ({
      status: 200,
      body: { items: [trigun] }
    });
    answer(new Response(null, { status: 204 }));
    await waitFor(() =>
      expect(
        requests().filter((r) => r === 'GET /api/me/watch-list')
      ).toHaveLength(2)
    );
    expect(screen.queryByText('Cowboy Bebop')).toBeNull();
  });

  it('puts the item back and says so when the remove fails', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({
        status: 200,
        body: { items: [bebop] }
      }),
      'DELETE /api/me/watch-list/1': () => ({
        status: 500,
        body: { error: 'Something went wrong' }
      })
    };
    renderWithClient(<OwnWatchList />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Remove Cowboy Bebop from watch list'
      })
    );

    expect(
      await screen.findByText(
        /Couldn't remove Cowboy Bebop: Something went wrong/
      )
    ).toBeTruthy();
    expect(screen.getByText('Cowboy Bebop')).toBeTruthy();
  });

  it('explains how to add anime when the list is empty', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({ status: 200, body: { items: [] } })
    };
    renderWithClient(<OwnWatchList />);

    expect(
      await screen.findByText(
        'Your watch list is empty. Add anime from any details page or card.'
      )
    ).toBeTruthy();
  });

  it('adds that only the user can see an empty private list', async () => {
    routes = {
      'GET /api/me/watch-list': () => ({ status: 200, body: { items: [] } })
    };
    renderWithClient(<OwnWatchList />, { ...me, watchListPublic: false });

    expect(
      await screen.findByText(
        'Your watch list is empty. Add anime from any details page or card. Only you can see it.'
      )
    ).toBeTruthy();
  });
});

describe('WatchListPrivacySwitch', () => {
  const toggle = () =>
    screen.getByRole('switch', {
      name: 'Show my watch list on my public profile'
    }) as HTMLInputElement;

  it('starts from the saved setting', () => {
    routes = {};
    renderWithClient(<WatchListPrivacySwitch />, {
      ...me,
      watchListPublic: false
    });

    expect(toggle().checked).toBe(false);
  });

  it('saves the new setting and updates the cached profile', async () => {
    routes = {
      'PATCH /api/me': () => ({
        status: 200,
        body: { ...me, watchListPublic: false }
      })
    };
    const queryClient = renderWithClient(<WatchListPrivacySwitch />);

    fireEvent.click(toggle());

    await waitFor(() =>
      expect(
        queryClient.getQueryData(meQuery().queryKey)?.watchListPublic
      ).toBe(false)
    );
    expect(toggle().checked).toBe(false);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({ watchListPublic: false });
  });

  it('goes back to the saved setting when saving fails', async () => {
    routes = {
      'PATCH /api/me': () => ({
        status: 500,
        body: { error: 'Something went wrong' }
      })
    };
    renderWithClient(<WatchListPrivacySwitch />);

    fireEvent.click(toggle());

    expect(await screen.findByText(/Couldn't save this setting/)).toBeTruthy();
    expect(toggle().checked).toBe(true);
  });
});

describe('PublicWatchList', () => {
  it('shows the list read-only', async () => {
    routes = {
      'GET /api/users/faye/watch-list': () => ({
        status: 200,
        body: { items: [bebop, trigun] }
      })
    };
    renderWithClient(<PublicWatchList username="faye" watchListPublic />);

    expect(await screen.findByText('Cowboy Bebop')).toBeTruthy();
    expect(screen.getByText('Trigun')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it("says when the user hasn't added anything", async () => {
    routes = {
      'GET /api/users/faye/watch-list': () => ({
        status: 200,
        body: { items: [] }
      })
    };
    renderWithClient(<PublicWatchList username="faye" watchListPublic />);

    expect(
      await screen.findByText("@faye hasn't added anything yet.")
    ).toBeTruthy();
  });

  it("doesn't ask for a list the profile says is private", () => {
    routes = {};
    renderWithClient(
      <PublicWatchList username="faye" watchListPublic={false} />
    );

    expect(
      screen.getByText('@faye keeps their watch list private.')
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the private message when the server answers 403', async () => {
    routes = {
      'GET /api/users/faye/watch-list': () => ({
        status: 403,
        body: { error: 'This watch list is private' }
      })
    };
    renderWithClient(<PublicWatchList username="faye" watchListPublic />);

    expect(
      await screen.findByText('@faye keeps their watch list private.')
    ).toBeTruthy();
  });
});

describe('myWatchListQuery', () => {
  it('uses the key the ticket names', () => {
    expect(myWatchListQuery().queryKey).toEqual(['me', 'watch-list']);
  });
});
