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
import AnimeCard from './animeCard';
import AnimeList from './animeList';
import { myWatchListQuery } from '@/helpers/apiQueries';
import { Anime, WatchListItem } from '@/types';

let auth: { isLoaded: boolean; isSignedIn: boolean };

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => auth,
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in">{children}</div>
  )
}));

// Just the fields the card reads
function anime(id: string, title: string): Anime {
  return {
    id,
    attributes: {
      canonicalTitle: title,
      titles: { en: title, ja_jp: title },
      subtype: 'TV',
      posterImage: null,
      episodeCount: 12,
      episodeLength: 24
    }
  } as unknown as Anime;
}

const onList: WatchListItem = {
  animeId: '1',
  title: 'Cowboy Bebop',
  posterUrl: null,
  subtype: 'TV',
  status: 'planned',
  addedAt: '2026-11-01T00:00:00.000Z'
};

// A small fake of the watch list API that remembers what was added
let serverItems: WatchListItem[];
const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
  const request = `${init?.method ?? 'GET'} ${path}`;
  if (request === 'GET /api/me/watch-list') {
    return new Response(JSON.stringify({ items: serverItems }), {
      status: 200
    });
  }
  if (request === 'POST /api/me/watch-list') {
    const { animeId } = JSON.parse(String(init?.body));
    const item = { ...onList, animeId, title: 'Trigun' };
    serverItems = [item, ...serverItems];
    return new Response(JSON.stringify(item), { status: 201 });
  }
  throw new Error(`Unexpected request ${request}`);
});

function renderWithClient(ui: React.ReactElement) {
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return queryClient;
}

const watchListRequests = () =>
  fetchMock.mock.calls.filter(
    ([path, init]) => path === '/api/me/watch-list' && !init?.method
  );

beforeEach(() => {
  auth = { isLoaded: true, isSignedIn: true };
  serverItems = [onList];
});

afterEach(() => {
  cleanup();
  fetchMock.mockClear();
  vi.unstubAllGlobals();
});

describe('AnimeCard', () => {
  it('keeps the details link and the watch list button apart', async () => {
    renderWithClient(<AnimeCard {...anime('6', 'Trigun')} />);

    const link = screen.getByRole('link');
    const button = await screen.findByRole('button', {
      name: 'Add Trigun to watch list'
    });

    expect(link.getAttribute('href')).toBe('/details/6');
    expect(link.contains(button)).toBe(false);
    expect(button.contains(link)).toBe(false);
    expect(within(link).queryByRole('button')).toBeNull();
  });

  it('puts the link first and the button second in the tab order', async () => {
    renderWithClient(<AnimeCard {...anime('6', 'Trigun')} />);
    const button = await screen.findByRole('button', {
      name: 'Add Trigun to watch list'
    });
    await waitFor(() => expect(button).toHaveProperty('disabled', false));

    // Everything a Tab key would stop on, in document order
    const tabStops = Array.from(
      document.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    ).filter((element) => element.tabIndex >= 0);

    expect(tabStops).toEqual([screen.getByRole('link'), button]);
  });

  it('opens the sign-in modal for a signed-out visitor, with no list request', () => {
    auth = { isLoaded: true, isSignedIn: false };
    renderWithClient(<AnimeCard {...anime('6', 'Trigun')} />);

    const button = screen.getByRole('button', {
      name: 'Add Trigun to watch list'
    });
    expect(button.closest('[data-testid="sign-in"]')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('adds the anime from the card', async () => {
    const queryClient = renderWithClient(
      <AnimeCard {...anime('6', 'Trigun')} />
    );
    const button = await screen.findByRole('button', {
      name: 'Add Trigun to watch list'
    });
    await waitFor(() => expect(button).toHaveProperty('disabled', false));

    fireEvent.click(button);

    await waitFor(() =>
      expect(
        queryClient
          .getQueryData(myWatchListQuery().queryKey)
          ?.map((item) => item.animeId)
      ).toContain('6')
    );
    expect(
      screen.getByRole('button', { name: 'Remove Trigun from watch list' })
    ).toBeTruthy();
  });
});

describe('AnimeList', () => {
  const twelve = Array.from({ length: 12 }, (_, index) =>
    index === 0
      ? anime('1', 'Cowboy Bebop')
      : anime(String(index + 100), `Anime ${index}`)
  );

  it('shows on each card whether it is on the list', async () => {
    renderWithClient(<AnimeList list={twelve} />);

    expect(
      await screen.findByRole('button', {
        name: 'Remove Cowboy Bebop from watch list'
      })
    ).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: /^Add .* to watch list$/ })
    ).toHaveLength(11);
  });

  it('asks for the watch list once, however many cards there are', async () => {
    renderWithClient(<AnimeList list={twelve} />);

    await screen.findByRole('button', {
      name: 'Remove Cowboy Bebop from watch list'
    });

    expect(watchListRequests()).toHaveLength(1);
  });
});
