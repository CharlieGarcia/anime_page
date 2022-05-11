import React from 'react';
import { NavLink } from 'react-router-dom';

function Home({ props }) {
  return (
    <div>
      <h1>My Anime Page</h1>
      <p>
        This is a page for testing create-react-app and make queries to <a href="http://anilist-api.readthedocs.io/en/latest/index.html" target="_blank"  rel="noopener noreferrer">anilist.co API</a>.
        <br />
        For browsering animes from the API list, please visit our <NavLink to="/browse">Browse section</NavLink> ;)
      </p>
    </div>
  );
}

export default Home;
