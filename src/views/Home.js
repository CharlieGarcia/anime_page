import React from 'react';
import { NavLink } from 'react-router-dom';

function Home({ props }) {
  return (
    <div>
      <h1>My Anime Page</h1>
      <p>
        This is a page for testing create-react-app and make queries to <a href="https://kitsu.docs.apiary.io/#introduction/json:api" target="_blank" rel="noopener noreferrer">kitsu API</a>.
        <br />
        For browsering animes from the API list, please visit our <NavLink to="/browse">Browse section</NavLink> ;)
      </p>
    </div>
  );
}

export default Home;
