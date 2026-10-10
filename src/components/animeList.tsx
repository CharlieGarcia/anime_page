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

type AnimeListProps = {
  list?: Anime[];
};

const AnimeList = ({ list = [] }: AnimeListProps): JSX.Element => {
  return (
    <Box sx={styles}>
      {list.length
        ? list.map((anime) => <AnimeCard key={anime.id} {...anime} />)
        : null}
    </Box>
  );
};

export default AnimeList;
