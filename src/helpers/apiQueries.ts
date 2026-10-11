import { queryOptions } from '@tanstack/react-query';
import { Profile, ProfileChanges, PublicProfile } from '@/types';

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
