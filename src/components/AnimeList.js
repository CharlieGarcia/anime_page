import React from 'react';
import styled from 'styled-components';
import AnimeCard from './AnimeCard';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-template-rows: auto;
  column-gap: 30px;
`;

function AnimeList({ list = [] }) {
  return (
    <GridContainer>
      {!list.length ? 'Content not found. Please try with other parameters' : null}
      {list.length ? list.map((anime, index) => <AnimeCard key={index} {...anime} />) : null}
    </GridContainer>
  );
}

export default AnimeList;
