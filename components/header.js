import React from 'react';
import Link from 'next/link';
import { Box } from '@mui/material';

export const Header = () => {
  const headerStyles = {
    backgroundColor: 'white',
    padding: '24px',
    position: 'sticky',
    top: '0',
    zIndex: '2'
  };

  return (
    <Box component="header" sx={headerStyles}>
      <Link href="/" style={{ textDecoration: 'none', fontSize: '24px' }}>
        My Anime
      </Link>
    </Box>
  );
};
