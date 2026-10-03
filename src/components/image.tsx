import React from 'react';
import { Box, SxProps } from '@mui/material';
// import Image, { ImageProps } from 'next/image';

interface ImageProps extends React.ComponentPropsWithoutRef<'img'> {
  alt?: string;
  sx?: SxProps
}

const customImage = ({ alt = '', ...props }: ImageProps) => (
  <Box component="img" {...props} alt={alt} />
);

export default customImage;
