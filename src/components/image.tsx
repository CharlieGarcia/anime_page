import React from 'react';
import NextImage from 'next/image';
import { Box, SxProps, Theme } from '@mui/material';

type ImageProps = {
  src: string;
  alt: string;
  // Shape of the box the image fills, as CSS aspect-ratio (for example '16 / 9').
  // The box reserves this space before the image loads, so nothing shifts.
  aspectRatio: string;
  // How wide the image is rendered at each viewport width, so the browser
  // requests a file no larger than it needs.
  sizes: string;
  // Load ahead of time; only for the main image at the top of a page
  preload?: boolean;
  // Load straight away instead of when scrolled near; for images visible on arrival
  eager?: boolean;
  sx?: SxProps<Theme>;
};

const Image = ({
  src,
  alt,
  aspectRatio,
  sizes,
  preload = false,
  eager = false,
  sx = []
}: ImageProps) => (
  <Box
    sx={[
      {
        position: 'relative',
        overflow: 'hidden',
        aspectRatio,
        '& img': { objectFit: 'cover' }
      },
      ...(Array.isArray(sx) ? sx : [sx])
    ]}>
    <NextImage
      src={src}
      alt={alt}
      sizes={sizes}
      preload={preload}
      loading={eager ? 'eager' : undefined}
      fill
    />
  </Box>
);

export default Image;
