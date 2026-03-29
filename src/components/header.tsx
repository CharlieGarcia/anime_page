import React from 'react';
import Link from 'next/link';
import { Box } from '@mui/material';
import { ThemeToggle } from './themeToggle';

export const Header = () => {
  const headerStyles = [(theme) => ({
    backgroundColor: theme.palette.background.default,
    padding: '24px',
    position: 'sticky',
    top: '0',
    zIndex: '2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  })];

  return (
    <Box component="header" sx={headerStyles}>
      <Link href="/" style={{ textDecoration: 'none', fontSize: '24px' }}>
        My Anime
      </Link>
      <ThemeToggle />
    </Box>
  );
};
