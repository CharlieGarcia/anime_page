import React from 'react';
import AnimeCard from './AnimeCard';

function AnimeList({ list = [] }) {
  return (
    <div className="anime-grid">
      {list.map((anime, index) => <AnimeCard key={index} {...anime} />)}
    </div>
  );
}

export default AnimeList;
