import React from 'react';
import { Box, Typography, SxProps } from '@mui/material';

const styles: SxProps = {
  textAlign: 'center',
}

export const Footer = (): JSX.Element => {
  const year = new Date().getFullYear();

  return (
    <Box component="footer">
      <Typography
        variant="h6"
        color="text.secondary"
        sx={styles}>
        &#169; Copyright {year}
      </Typography>
    </Box>
  );
};
