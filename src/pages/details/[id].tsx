import React, { CSSProperties } from 'react';
import { GetServerSidePropsContext } from 'next';
import { dehydrate, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Box, Button, Typography } from '@mui/material';
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

const styles: { tags: CSSProperties } = {
  tags: {
    marginRight: 15,
    marginTop: 15,
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
            style={{ width: '100%', height: 'auto' }}
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
            style={styles.tags}
            key={category.id}
            component={Link}
            href={category.slug}>
            {category.title}
          </Button>
        ))}
      </Box>
      <Box style={{ marginTop: '15px' }}>
        <Typography
          variant="h2"
          component="h2"
          color="text.secondary"
          sx={{ marginBottom: '15px' }}>
          Episodes
        </Typography>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {episodes.map((episode) => (
            <Accordion
              key={episode.id}
              title={`${episode.number} - ${episode.title}`}
              synopsis={episode.synopsis}
              thumbnailUrl={episode.thumbnailUrl}
            />
          ))}
          <div ref={sentinelRef} style={{ height: '20px' }} />
          {isLoadingEpisodes && <Typography>Loading episodes...</Typography>}
          {episodes.length === 0 && !isLoadingEpisodes && (
            <Typography>No episodes found</Typography>
          )}
        </Box>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps({
  params
}: GetServerSidePropsContext<{ id: string }>) {
  const id = params?.id ?? '';
  const queryClient = makeQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(animeDetailsQuery(id)),
    queryClient.prefetchQuery(animeCategoriesQuery(id)),
    queryClient.prefetchInfiniteQuery(animeEpisodesQuery(id))
  ]);

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Detail;
