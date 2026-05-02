import React from 'react';
import AnimeCard from './animeCard';
import { Box, SxProps } from '@mui/material';
import { Anime } from '@/types';

const styles: SxProps = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, auto)',
  gridTemplateRows: 'auto',
  gap: '30px'
};

type AnimeListProps = {
  list?: Anime[];
};

const AnimeList = ({ list = [] }: AnimeListProps): JSX.Element => {
  return (
    <Box sx={styles}>
      {list.length
        ? list.map((anime, index) => <AnimeCard key={index} {...anime} />)
        : null}
    </Box>
  );
};

export default AnimeList;
