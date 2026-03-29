import React from 'react';
import { Box, Typography } from '@mui/material';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box component="footer">
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ textAlign: 'center' }}>
        &#169; Copyright {year}
      </Typography>
    </Box>
  );
};
