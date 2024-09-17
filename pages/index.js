import React, { Fragment } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../components/loadingSpinner';
import { Layout } from '../components/layout';
import AnimeList from '../components/animeList';
import useFetch from '../hooks/useFetch';

const ANIME_LIMIT = 12;

const Home = () => {
  const { data, error, isLoading } = useFetch('/trending/anime', {
    limit: ANIME_LIMIT
  });

  return (
    <Layout>
      <h1>My Anime</h1>
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
      <h2>Top {ANIME_LIMIT} Trending Animes</h2>
      {error ? <pre>error</pre> : <AnimeList list={data} />}
      {isLoading && <LoadingSpinner />}
    </Layout>
  );
};

export default Home;
