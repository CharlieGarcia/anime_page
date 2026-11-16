import React from 'react';
import { Box } from '@mui/material';

type PosterGridProps = {
  // An <ol> for a ranked list, a <ul> otherwise
  ordered?: boolean;
  // PosterCards
  children: React.ReactNode;
};

// Lays out PosterCards in columns at least 140px wide: two on phones, more on wider screens
const PosterGrid = ({ ordered = false, children }: PosterGridProps) => (
  <Box
    component={ordered ? 'ol' : 'ul'}
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '24px',
      listStyle: 'none',
      margin: 0,
      padding: 0
    }}>
    {children}
  </Box>
);

export default PosterGrid;
