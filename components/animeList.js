import React from 'react';
import AnimeCard from './animeCard';
import { Box } from '@mui/material';

const styles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, auto)',
  gridTemplateRows: 'auto',
  gap: '30px'
};

const AnimeList = ({ list = [] }) => {
  return (
    <Box sx={styles}>
      {list.length
        ? list.map((anime, index) => <AnimeCard key={index} {...anime} />)
        : null}
    </Box>
  );
};

export default AnimeList;
