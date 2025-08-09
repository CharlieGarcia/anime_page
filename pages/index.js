import React from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import AnimeList from '@/components/animeList';
import { fetch } from '@/helpers/request';
import _get from 'lodash/get';

const ANIME_LIMIT = 12;

const Home = ({ data, error }) => {

  return (
    <Layout>
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
      {error ? error : <AnimeList list={data} />}
    </Layout>
  );
};

export async function getServerSideProps() {
  let data = [];
  let error = null;

  try {
    const response = await fetch('/trending/anime', {
      limit: ANIME_LIMIT
    });
    data = _get(response, 'data.data', []);
  } catch (err) {
    error = err;
  }

  return {
    props: {
      data,
      error
    }
  };
};

export default Home;
