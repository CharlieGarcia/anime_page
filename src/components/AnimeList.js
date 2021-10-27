import React from 'react';
import AnimeCard from './AnimeCard';

function AnimeList({ list = [] }) {
  return (
    <div>
      {!list.length ? 'Content not found. Please try with other parameters' : null}
      {list.length ? list.map((anime, index) => <AnimeCard key={index} {...anime} />) : null}
    </div>
  );
}

export default AnimeList;
