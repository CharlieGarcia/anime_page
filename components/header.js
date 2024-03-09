import React from 'react';
import Link from 'next/link';
import { Box } from '@mui/material';

export const Header = () => {
  return (
    <Box component="header">
      <Link href="/">Header component</Link>
    </Box>
  );
};
