import React from 'react';
import Link from 'next/link';
import { dehydrate, useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import AnimeList from '@/components/animeList';
import LoadingSpinner from '@/components/loadingSpinner';
import { makeQueryClient } from '@/helpers/queryClient';
import { TRENDING_LIMIT, trendingAnimeQuery } from '@/helpers/queries';
import {
  REVALIDATE_AFTER_ERROR_SECONDS,
  REVALIDATE_SECONDS
} from '@/constants';

const Home = () => {
  const { data, error, isPending } = useQuery(trendingAnimeQuery());

  return (
    <Layout>
      <h1>Anime Discovery</h1>
      <p>
        This is an anime page using the{' '}
        <a
          href="https://kitsu.docs.apiary.io/#introduction/json:api"
          target="_blank"
          rel="noopener noreferrer">
          Kitsu API
        </a>
        .
      </p>
      <p>
        For browsering animes from the API list, please visit our{' '}
        <Link href="/search">Browse section</Link>
      </p>
      <h2>Top {TRENDING_LIMIT} Trending Animes</h2>
      {error ? error.message : isPending ? <LoadingSpinner /> : <AnimeList list={data} />}
    </Layout>
  );
};

export async function getStaticProps() {
  const queryClient = makeQueryClient();
  let revalidate = REVALIDATE_SECONDS;

  try {
    await queryClient.fetchQuery(trendingAnimeQuery());
  } catch {
    // Kitsu failed: render without prefetched data (the browser fetches it instead)
    // and regenerate the page sooner.
    revalidate = REVALIDATE_AFTER_ERROR_SECONDS;
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    },
    revalidate
  };
}

export default Home;
