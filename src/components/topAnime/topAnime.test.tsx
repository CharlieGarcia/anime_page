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
import PublicTopAnime from './PublicTopAnime';
import TopAnimeEditor from './TopAnimeEditor';
import TopAnimeList from './TopAnimeList';
import TopAnimePrivacySwitch from './TopAnimePrivacySwitch';
import {
  meQuery,
  myTopAnimeQuery,
  userTopAnimeQuery
} from '@/helpers/apiQueries';
import type { AnimeSnapshot } from '@/helpers/animeSnapshot';
import { Profile, TopAnimeItem } from '@/types';

// Every anime the fake Kitsu and the fake server know, by id
const catalogue: Record<string, AnimeSnapshot> = {
  '1': { title: 'Cowboy Bebop', posterUrl: null, subtype: 'TV' },
  '6': { title: 'Trigun', posterUrl: null, subtype: 'TV' },
  '7': { title: 'Frieren', posterUrl: null, subtype: 'TV' },
  '8': { title: 'Frieren Movie', posterUrl: null, subtype: 'movie' },
  ...Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [
      String(100 + i),
      { title: `Filler ${i + 1}`, posterUrl: null, subtype: 'TV' }
    ])
  )
};

const ranked = (ids: string[]): TopAnimeItem[] =>
  ids.map((animeId, index) => ({
    rank: index + 1,
    animeId,
    ...catalogue[animeId]
  }));

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

// What the fake server has stored. Writes change it, so a refetch after a write
// answers with what was written.
let server: { profile: Profile; ids: string[] };
// Make the next PUT fail with this status
let failPut: number | null;

type Reply = { status: number; body?: unknown };

function answer(path: string, init?: RequestInit): Reply {
  const method = init?.method ?? 'GET';

  // Kitsu title search
  if (path.includes('/anime?')) {
    const text = new URL(path).searchParams.get('filter[text]') ?? '';
    const data = Object.entries(catalogue)
      .filter(([, anime]) =>
        anime.title.toLowerCase().includes(text.toLowerCase())
      )
      .slice(0, 5)
      .map(([id, anime]) => ({
        id,
        attributes: {
          canonicalTitle: anime.title,
          posterImage: null,
          subtype: anime.subtype
        }
      }));
    return { status: 200, body: { data } };
  }

  switch (`${method} ${path}`) {
    case 'GET /api/me/top-anime':
      return { status: 200, body: { items: ranked(server.ids) } };
    case 'PUT /api/me/top-anime': {
      if (failPut) {
        return { status: failPut, body: { error: 'Something went wrong' } };
      }
      server.ids = JSON.parse(String(init?.body)).animeIds;
      return { status: 200, body: { items: ranked(server.ids) } };
    }
    case 'PATCH /api/me':
      server.profile = { ...server.profile, ...JSON.parse(String(init?.body)) };
      return { status: 200, body: server.profile };
    case 'GET /api/users/faye/top-anime':
      return server.profile.topAnimePublic
        ? { status: 200, body: { items: ranked(server.ids) } }
        : { status: 403, body: { error: 'This top 10 is private' } };
  }
  throw new Error(`Unexpected request ${method} ${path}`);
}

const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
  const { status, body } = answer(path, init);
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status
  });
});

const requests = () =>
  fetchMock.mock.calls.map(
    ([path, init]) => `${init?.method ?? 'GET'} ${path}`
  );

function renderWithClient(ui: React.ReactElement) {
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } }
  });
  queryClient.setQueryData(meQuery().queryKey, server.profile);
  const view = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
  return { queryClient, ...view };
}

// Row titles, top to bottom
const titles = () =>
  screen
    .getAllByRole('listitem')
    .map((row) => within(row).getByRole('heading').textContent);

const button = (name: string) =>
  screen.getByRole('button', { name }) as HTMLButtonElement;

const announcement = () => screen.getByRole('status').textContent;

const searchBox = () =>
  screen.getByRole('combobox', { name: 'Add anime' }) as HTMLInputElement;

// Types into the Add anime box and picks the first match with the keyboard
async function addWithKeyboard(text: string, title: string) {
  const input = searchBox();
  input.focus();
  fireEvent.change(input, { target: { value: text } });
  // The first match is highlighted, so Enter picks it
  const [first] = await screen.findAllByRole('option');
  expect(first.textContent).toMatch(new RegExp(`^${title}`));
  fireEvent.keyDown(input, { key: 'Enter' });
}

beforeEach(() => {
  server = { profile: me, ids: ['1', '6', '7'] };
  failPut = null;
});

afterEach(() => {
  cleanup();
  fetchMock.mockClear();
  vi.unstubAllGlobals();
});

describe('TopAnimeList', () => {
  it('shows a numbered list of cards linking to their details pages', () => {
    render(<TopAnimeList items={ranked(['6', '1'])} emptyMessage="Empty" />);

    expect(screen.getByRole('list').tagName).toBe('OL');
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByRole('link').getAttribute('href')).toBe(
      '/details/6'
    );
    expect(within(rows[0]).getByRole('link').textContent).toContain('1');
    expect(within(rows[1]).getByRole('link').textContent).toContain('2');
    expect(titles()).toEqual(['Trigun', 'Cowboy Bebop']);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the empty message when there are no items', () => {
    render(<TopAnimeList items={[]} emptyMessage="Nothing here" />);

    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('TopAnimeEditor', () => {
  it('shows the saved list with Move up, Move down and Remove on each row', async () => {
    renderWithClient(<TopAnimeEditor />);

    await screen.findByText('Cowboy Bebop');
    expect(titles()).toEqual(['Cowboy Bebop', 'Trigun', 'Frieren']);
    expect(button('Move Cowboy Bebop up').disabled).toBe(true);
    expect(button('Move Cowboy Bebop down').disabled).toBe(false);
    expect(button('Move Frieren up').disabled).toBe(false);
    expect(button('Move Frieren down').disabled).toBe(true);
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(3);
    expect(button('Save top 10').disabled).toBe(true);
    expect(button('Cancel').disabled).toBe(true);
  });

  it('moves rows locally, announces each move and keeps focus on the moved row', async () => {
    renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');

    button('Move Cowboy Bebop down').focus();
    fireEvent.click(button('Move Cowboy Bebop down'));

    expect(titles()).toEqual(['Trigun', 'Cowboy Bebop', 'Frieren']);
    expect(announcement()).toBe('Cowboy Bebop moved to 2');
    expect(document.activeElement).toBe(button('Move Cowboy Bebop down'));

    // At the bottom Move down is disabled, so focus goes to Move up
    fireEvent.click(button('Move Cowboy Bebop down'));

    expect(titles()).toEqual(['Trigun', 'Frieren', 'Cowboy Bebop']);
    expect(announcement()).toBe('Cowboy Bebop moved to 3');
    expect(button('Move Cowboy Bebop down').disabled).toBe(true);
    expect(document.activeElement).toBe(button('Move Cowboy Bebop up'));

    fireEvent.click(button('Move Frieren up'));

    expect(titles()).toEqual(['Frieren', 'Trigun', 'Cowboy Bebop']);
    expect(announcement()).toBe('Frieren moved to 1');
    expect(document.activeElement).toBe(button('Move Frieren down'));

    // Nothing is sent until Save
    expect(requests()).toEqual(['GET /api/me/top-anime']);
    expect(button('Save top 10').disabled).toBe(false);
  });

  it('saves the new order, which a reload then shows', async () => {
    const { queryClient, unmount } = renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');

    fireEvent.click(button('Move Frieren up'));
    button('Save top 10').focus();
    fireEvent.click(button('Save top 10'));

    await waitFor(() => expect(announcement()).toBe('Top 10 saved'));
    const [, init] = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'PUT'
    )!;
    expect(JSON.parse(String(init?.body))).toEqual({
      animeIds: ['1', '7', '6']
    });
    expect(
      queryClient
        .getQueryData(myTopAnimeQuery().queryKey)
        ?.map((item) => item.animeId)
    ).toEqual(['1', '7', '6']);
    expect(titles()).toEqual(['Cowboy Bebop', 'Frieren', 'Trigun']);
    expect(button('Save top 10').disabled).toBe(true);
    // Save is disabled now, so focus moved to the search box rather than dropping
    expect(document.activeElement).toBe(searchBox());

    unmount();
    fetchMock.mockClear();
    renderWithClient(<TopAnimeEditor />);

    await screen.findByText('Cowboy Bebop');
    expect(requests()).toEqual(['GET /api/me/top-anime']);
    expect(titles()).toEqual(['Cowboy Bebop', 'Frieren', 'Trigun']);
  });

  it('marks the public list stale when it saves', async () => {
    const { queryClient } = renderWithClient(<TopAnimeEditor />);
    queryClient.setQueryData(
      userTopAnimeQuery('spike').queryKey,
      ranked(server.ids)
    );
    await screen.findByText('Cowboy Bebop');

    fireEvent.click(button('Move Frieren up'));
    fireEvent.click(button('Save top 10'));

    await waitFor(() => expect(announcement()).toBe('Top 10 saved'));
    expect(
      queryClient.getQueryState(userTopAnimeQuery('spike').queryKey)
        ?.isInvalidated
    ).toBe(true);
  });

  it('discards unsaved changes on Cancel', async () => {
    renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');

    fireEvent.click(button('Move Frieren up'));
    fireEvent.click(button('Remove Cowboy Bebop from top 10'));
    expect(titles()).toEqual(['Frieren', 'Trigun']);

    button('Cancel').focus();
    fireEvent.click(button('Cancel'));

    expect(titles()).toEqual(['Cowboy Bebop', 'Trigun', 'Frieren']);
    expect(announcement()).toBe('Changes discarded');
    expect(button('Cancel').disabled).toBe(true);
    expect(document.activeElement).toBe(searchBox());
    expect(requests()).toEqual(['GET /api/me/top-anime']);
  });

  it('removes a row and moves focus to the row that took its place', async () => {
    renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');

    fireEvent.click(button('Remove Trigun from top 10'));

    expect(titles()).toEqual(['Cowboy Bebop', 'Frieren']);
    expect(announcement()).toBe('Trigun removed');
    expect(document.activeElement).toBe(button('Remove Frieren from top 10'));

    // The last row has none below it, so focus goes to the one above
    fireEvent.click(button('Remove Frieren from top 10'));

    expect(document.activeElement).toBe(
      button('Remove Cowboy Bebop from top 10')
    );

    // With no rows left, focus goes to the search box
    fireEvent.click(button('Remove Cowboy Bebop from top 10'));

    expect(
      screen.getByText('Pick up to 10 favourites and put them in order.')
    ).toBeTruthy();
    expect(document.activeElement).toBe(searchBox());
  });

  it('adds an anime from the search box with the keyboard', async () => {
    renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');
    fireEvent.click(button('Remove Frieren from top 10'));

    await addWithKeyboard('frie', 'Frieren');

    await waitFor(() =>
      expect(titles()).toEqual(['Cowboy Bebop', 'Trigun', 'Frieren'])
    );
    expect(announcement()).toBe('Frieren added at 3.');
    expect(searchBox().value).toBe('');
    // Kitsu was asked once the typing paused, for five titles
    const search = requests().find((request) => request.includes('/anime?'));
    expect(search).toContain('filter%5Btext%5D=frie');
    expect(search).toContain('page%5Blimit%5D=5');
  });

  it("doesn't let an anime already in the list be picked again", async () => {
    renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');

    searchBox().focus();
    fireEvent.change(searchBox(), { target: { value: 'frie' } });

    const [taken, free] = await screen.findAllByRole('option');
    expect(taken.textContent).toBe('FrierenTV · Already in your top 10');
    expect(taken.getAttribute('aria-disabled')).toBe('true');
    expect(free.textContent).toBe('Frieren Moviemovie');
    expect(free.getAttribute('aria-disabled')).not.toBe('true');
  });

  it('disables the search box at 10 anime and says the list is full', async () => {
    server.ids = Object.keys(catalogue)
      .filter((id) => Number(id) >= 100)
      .slice(0, 9);
    renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Filler 1');

    await addWithKeyboard('frieren m', 'Frieren Movie');

    await waitFor(() => expect(searchBox().disabled).toBe(true));
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(screen.getByText('Your top 10 is full')).toBeTruthy();
    expect(announcement()).toBe(
      'Frieren Movie added at 10. Your top 10 is full.'
    );
    // The search box can't keep focus once disabled
    expect(document.activeElement).toBe(button('Save top 10'));

    // Removing one makes room again
    fireEvent.click(button('Remove Filler 1 from top 10'));
    expect(searchBox().disabled).toBe(false);
    expect(screen.queryByText('Your top 10 is full')).toBeNull();
  });

  it('keeps the changes and says so when saving fails', async () => {
    failPut = 502;
    renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');

    fireEvent.click(button('Move Frieren up'));
    fireEvent.click(button('Save top 10'));

    expect(
      await screen.findByText("Couldn't save your top 10: Something went wrong")
    ).toBeTruthy();
    expect(titles()).toEqual(['Cowboy Bebop', 'Frieren', 'Trigun']);
    expect(button('Save top 10').disabled).toBe(false);
  });

  it('follows the saved list while it has no unsaved changes', async () => {
    const { queryClient } = renderWithClient(<TopAnimeEditor />);
    await screen.findByText('Cowboy Bebop');

    // Moving a row and back leaves nothing to save
    fireEvent.click(button('Move Cowboy Bebop down'));
    fireEvent.click(button('Move Cowboy Bebop up'));
    // Such as an add from the details page button
    queryClient.setQueryData(
      myTopAnimeQuery().queryKey,
      ranked(['1', '6', '7', '8'])
    );

    await waitFor(() =>
      expect(titles()).toEqual([
        'Cowboy Bebop',
        'Trigun',
        'Frieren',
        'Frieren Movie'
      ])
    );
  });

  it('explains how to start when the list is empty', async () => {
    server.ids = [];
    renderWithClient(<TopAnimeEditor />);

    expect(
      await screen.findByText('Pick up to 10 favourites and put them in order.')
    ).toBeTruthy();
  });

  it('adds that only the user can see an empty private list', async () => {
    server = { profile: { ...me, topAnimePublic: false }, ids: [] };
    renderWithClient(<TopAnimeEditor />);

    expect(
      await screen.findByText(
        'Pick up to 10 favourites and put them in order. Only you can see it.'
      )
    ).toBeTruthy();
  });
});

describe('TopAnimePrivacySwitch', () => {
  const toggle = () =>
    screen.getByRole('switch', {
      name: 'Show my top 10 on my public profile'
    }) as HTMLInputElement;

  it('starts from the saved setting', () => {
    server.profile = { ...me, topAnimePublic: false };
    renderWithClient(<TopAnimePrivacySwitch />);

    expect(toggle().checked).toBe(false);
  });

  it('saves the new setting and updates the cached profile', async () => {
    const { queryClient } = renderWithClient(<TopAnimePrivacySwitch />);

    fireEvent.click(toggle());

    await waitFor(() =>
      expect(queryClient.getQueryData(meQuery().queryKey)?.topAnimePublic).toBe(
        false
      )
    );
    expect(toggle().checked).toBe(false);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({ topAnimePublic: false });
    // The watch list setting is left alone
    expect(server.profile.watchListPublic).toBe(true);
  });
});

describe('PublicTopAnime', () => {
  it('shows the ranked list read-only', async () => {
    renderWithClient(<PublicTopAnime username="faye" topAnimePublic />);

    await screen.findByText('Cowboy Bebop');
    expect(titles()).toEqual(['Cowboy Bebop', 'Trigun', 'Frieren']);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it("says when the user hasn't picked a top 10", async () => {
    server.ids = [];
    renderWithClient(<PublicTopAnime username="faye" topAnimePublic />);

    expect(
      await screen.findByText("@faye hasn't picked a top 10 yet.")
    ).toBeTruthy();
  });

  it("doesn't ask for a list the profile says is private", () => {
    renderWithClient(<PublicTopAnime username="faye" topAnimePublic={false} />);

    expect(screen.getByText('@faye keeps their top 10 private.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the private message when the server answers 403', async () => {
    server.profile = { ...me, topAnimePublic: false };
    renderWithClient(<PublicTopAnime username="faye" topAnimePublic />);

    expect(
      await screen.findByText('@faye keeps their top 10 private.')
    ).toBeTruthy();
  });
});

describe('top 10 query keys', () => {
  it('uses the keys the ticket names', () => {
    expect(myTopAnimeQuery().queryKey).toEqual(['me', 'top-anime']);
    expect(userTopAnimeQuery('Faye').queryKey).toEqual([
      'users',
      'faye',
      'top-anime'
    ]);
  });
});
