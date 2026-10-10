import React from 'react';
import Link from 'next/link';
import { Box, SxProps } from '@mui/material';
import { ThemeToggle } from './themeToggle';

export const Header = () => {
  const headerStyles = [
    {
      backgroundColor: 'background.default',
      padding: '24px',
      position: 'sticky',
      top: '0',
      zIndex: '2',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  ] as SxProps;

  return (
    <Box component="header" sx={headerStyles}>
      <Box component="nav" aria-label="Main">
        <Box
          component={Link}
          href="/"
          sx={{ textDecoration: 'none', fontSize: '24px' }}>
          My Anime
        </Box>
      </Box>
      <ThemeToggle />
    </Box>
  );
};
