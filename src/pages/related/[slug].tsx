import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import AnimeList from '@/components/animeList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { relatedAnimeQuery } from '@/helpers/queries';

function Related() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const { data, error, isPending, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      ...relatedAnimeQuery(slug),
      enabled: router.isReady && Boolean(slug)
    });
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage
  );

  const animes = data?.pages.flatMap((page) => page.items) ?? [];
  const totalAnimes = data?.pages[0]?.total ?? 0;
  const isLoadingRelatedAnimes = isLoading || isFetchingNextPage;
  const title: string = slug.replace(/-/g, ' ');

  return (
    <Layout>
      <Box>
        <h1>Related Animes: {title}</h1>
        <Box role="region" aria-live="polite" aria-label="Related animes">
          <h2>Results: {totalAnimes}</h2>
          {error ? <Typography>{error.message}</Typography> : null}
          {animes.length ? <AnimeList list={animes} /> : null}
        </Box>
        <Box ref={sentinelRef} sx={{ height: '20px' }} />
        {isLoadingRelatedAnimes && <Typography aria-live="polite">Loading related animes...</Typography>}
        {animes.length === 0 && !isPending && (
          <Typography>No related animes found</Typography>
        )}
      </Box>
    </Layout>
  );
}

export default Related;
