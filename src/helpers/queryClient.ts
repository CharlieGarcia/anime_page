import { QueryClient } from '@tanstack/react-query';

// Cached responses are considered fresh for this long before a refetch is triggered
export const QUERY_CACHE_TTL_MS = 3000;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CACHE_TTL_MS
      }
    }
  });
}
