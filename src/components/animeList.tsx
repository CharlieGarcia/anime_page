import React from 'react';
import AnimeCard from './animeCard';
import { Box, SxProps } from '@mui/material';
import { Anime } from '@/types';

const styles: SxProps = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gridTemplateRows: 'auto',
  gap: '30px'
};

// The first row of the grid (up to four cards) is visible when the page opens
const EAGER_CARDS = 4;

type AnimeListProps = {
  list?: Anime[];
};

const AnimeList = ({ list = [] }: AnimeListProps): JSX.Element => {
  return (
    <Box sx={styles}>
      {list.length
        ? list.map((anime, index) => (
            <AnimeCard
              key={anime.id}
              {...anime}
              eagerImage={index < EAGER_CARDS}
            />
          ))
        : null}
    </Box>
  );
};

export default AnimeList;
