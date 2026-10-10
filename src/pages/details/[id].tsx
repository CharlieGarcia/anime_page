import React from 'react';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import { dehydrate, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Box, Button, SxProps, Typography } from '@mui/material';
import Link from 'next/link';
import Image from '@/components/image';
import Accordion from '@/components/accordion';
import { Layout } from '@/components/layout';
import LoadingSpinner from '@/components/loadingSpinner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { makeQueryClient } from '@/helpers/queryClient';
import {
  animeCategoriesQuery,
  animeDetailsQuery,
  animeEpisodesQuery
} from '@/helpers/queries';
import { KitsuRequestError } from '@/helpers/request';
import {
  REVALIDATE_AFTER_ERROR_SECONDS,
  REVALIDATE_SECONDS
} from '@/constants';

const styles: Record<string, SxProps> = {
  tags: {
    marginRight: '15px',
    marginTop: '15px',
    textTransform: 'capitalize'
  }
};

type DetailProps = {
  id: string;
};

function Detail({ id }: DetailProps) {
  const { data: info, error } = useQuery(animeDetailsQuery(id));
  const { data: categories = [] } = useQuery(animeCategoriesQuery(id));
  const {
    data: episodesData,
    isPending: isPendingEpisodes,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery(animeEpisodesQuery(id));
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(
    fetchNextPage,
    hasNextPage && !isFetchingNextPage
  );

  const episodes = episodesData?.pages.flatMap((page) => page.items) ?? [];
  const totalEpisodes = episodesData?.pages[0]?.total ?? 0;
  const isLoadingEpisodes = isPendingEpisodes || isFetchingNextPage;

  if (error) {
    return <Layout>{error.message}</Layout>;
  }

  if (!info) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h1" component="h1" color="text.secondary">
        {info.attributes?.titles?.en_jp}
      </Typography>
      <Typography variant="body1" component="p" color="text.secondary">
        {` (${totalEpisodes} episodes)`}
      </Typography>
      <Box>
        {info.attributes?.coverImage?.large && (
          <Image
            sx={{ width: '100%', height: 'auto' }}
            src={info.attributes.coverImage.large}
            alt={info.attributes?.titles?.en_jp || 'Anime cover'}
          />
        )}
      </Box>
      <Box>
        <Typography variant="h6" color="text.secondary">
          Synopsis:
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {info.attributes?.synopsis}
        </Typography>
        {categories.map((category) => (
          <Button
            variant="outlined"
            sx={styles.tags}
            key={category.id}
            component={Link}
            href={category.slug}>
            {category.title}
          </Button>
        ))}
      </Box>
      <Box sx={{ marginTop: '15px' }}>
        <Typography
          variant="h2"
          component="h2"
          color="text.secondary"
          sx={{ marginBottom: '15px' }}>
          Episodes
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {episodes.map((episode) => (
            <Accordion
              key={episode.id}
              title={`${episode.number} - ${episode.title}`}
              synopsis={episode.synopsis}
              thumbnailUrl={episode.thumbnailUrl}
            />
          ))}
          <Box ref={sentinelRef} sx={{ height: '20px' }} />
          {isLoadingEpisodes && <Typography>Loading episodes...</Typography>}
          {episodes.length === 0 && !isLoadingEpisodes && (
            <Typography>No episodes found</Typography>
          )}
        </Box>
      </Box>
    </Layout>
  );
}

// No details pages are built ahead of time; each one is generated on its first request.
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking'
});

export async function getStaticProps({
  params
}: GetStaticPropsContext<{ id: string }>) {
  const id = params?.id ?? '';
  const queryClient = makeQueryClient();
  let revalidate = REVALIDATE_SECONDS;

  const [details] = await Promise.allSettled([
    queryClient.fetchQuery(animeDetailsQuery(id)),
    queryClient.prefetchQuery(animeCategoriesQuery(id)),
    queryClient.prefetchInfiniteQuery(animeEpisodesQuery(id))
  ]);

  if (details.status === 'rejected') {
    // Kitsu answers 404 for an unknown id and 400 for a malformed one
    if (
      details.reason instanceof KitsuRequestError &&
      [400, 404].includes(details.reason.status)
    ) {
      return { notFound: true, revalidate };
    }
    // Kitsu failed: render without prefetched data (the browser fetches it instead)
    // and regenerate the page sooner.
    revalidate = REVALIDATE_AFTER_ERROR_SECONDS;
  }

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient)
    },
    revalidate
  };
}

export default Detail;
