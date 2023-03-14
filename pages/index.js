import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import _get from 'lodash/get';
import AnimeList from '../components/AnimeList';
import { fetch } from '../helpers/request';

const Home = () => {
  const [animeList, setAnimeList] = useState([]);

  useEffect(() => {
    const fetchAnimeList = async () => {
      const animes = await fetch('/trending/anime');

      setAnimeList(_get(animes, 'data.data', []));
    };

    fetchAnimeList().catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <h1>My Anime Page</h1>
      <p>
        This is a page for testing create-react-app and make queries to{' '}
        <a
          href="https://kitsu.docs.apiary.io/#introduction/json:api"
          target="_blank"
          rel="noopener noreferrer">
          kitsu API
        </a>
        .
        <br />
        For browsering animes from the API list, please visit our{' '}
        <Link href="/search">Browse section</Link>
      </p>
      <h2>Top 10 Trending Animes</h2>
      <AnimeList list={animeList} />
    </div>
  );
};

export default Home;
