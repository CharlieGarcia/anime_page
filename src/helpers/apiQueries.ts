import {
  mutationOptions,
  queryOptions,
  type QueryClient
} from '@tanstack/react-query';
import { Profile, ProfileChanges, PublicProfile, WatchListItem } from '@/types';

// A failed call to our own API. fieldErrors maps a form field to its message.
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error || 'Something went wrong',
      body?.fieldErrors
    );
  }

  return body as T;
}

// A missing or signed-out result is an answer, not something to retry
const noRetryOnClientError = (failureCount: number, error: Error) =>
  !(error instanceof ApiError && error.status < 500) && failureCount < 2;

export const meQuery = () =>
  queryOptions({
    queryKey: ['me'],
    queryFn: () => api<Profile>('/api/me'),
    retry: noRetryOnClientError
  });

export const userQuery = (username: string) =>
  queryOptions({
    queryKey: ['users', username.toLowerCase()],
    queryFn: () =>
      api<PublicProfile>(`/api/users/${encodeURIComponent(username)}`),
    retry: noRetryOnClientError
  });

export const updateProfile = (changes: ProfileChanges) =>
  api<Profile>('/api/me', { method: 'PATCH', body: JSON.stringify(changes) });

type WatchListResponse = { items: WatchListItem[] };

// The signed-in user's own watch list, newest first
export const myWatchListQuery = () =>
  queryOptions({
    queryKey: ['me', 'watch-list'],
    queryFn: async () =>
      (await api<WatchListResponse>('/api/me/watch-list')).items,
    retry: noRetryOnClientError
  });

// Anyone's watch list. Fails with a 403 ApiError when its owner made it private.
export const userWatchListQuery = (username: string) =>
  queryOptions({
    queryKey: ['users', username.toLowerCase(), 'watch-list'],
    queryFn: async () =>
      (
        await api<WatchListResponse>(
          `/api/users/${encodeURIComponent(username)}/watch-list`
        )
      ).items,
    retry: noRetryOnClientError
  });

// Takes the anime off the signed-in user's list straight away, and puts it back
// if the server says no
export const removeFromWatchListMutation = (queryClient: QueryClient) => {
  const { queryKey } = myWatchListQuery();

  const mutationKey = ['me', 'watch-list', 'remove'];

  return mutationOptions({
    mutationKey,
    mutationFn: (item: WatchListItem) =>
      api<null>(`/api/me/watch-list/${encodeURIComponent(item.animeId)}`, {
        method: 'DELETE'
      }),
    onMutate: async (item) => {
      // A refetch already on its way would bring the item back
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (items) =>
        items?.filter((entry) => entry.animeId !== item.animeId)
      );
      return { previous };
    },
    onError: (_error, _item, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => {
      // With several removes in flight, refetching after the first would bring the
      // others back for a moment; refetch once, after the last
      if (queryClient.isMutating({ mutationKey }) === 1) {
        return queryClient.invalidateQueries({ queryKey });
      }
    }
  });
};
