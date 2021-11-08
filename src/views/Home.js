import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import _get from 'lodash/get';
import AnimeList from '../components/AnimeList';
import { fetch } from '../helpers/request';

function Home() {
  const [animeList, setAnimeList] = useState([]);

  useEffect(async () => {
    const animes = await fetch('/trending/anime');

    setAnimeList(_get(animes, 'data.data', []));
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
        <NavLink to="/search">Browse section</NavLink> ;)
      </p>
      <h2>Top 10 Trending Animes</h2>
      <AnimeList list={animeList} />
    </div>
  );
}

export default Home;
