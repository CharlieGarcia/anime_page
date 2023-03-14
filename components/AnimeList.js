import React from 'react';
import AnimeCard from './AnimeCard';

const GridContainer = `
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-template-rows: auto;
  column-gap: 30px;
`;

const AnimeList = ({ list = [] }) => {
  return (
    <div>
      {!list.length
        ? 'Content not found. Please try with other parameters'
        : null}
      {list.length
        ? list.map((anime, index) => <AnimeCard key={index} {...anime} />)
        : null}
    </div>
  );
};

export default AnimeList;
