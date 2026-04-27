import React from 'react';
import { SxProps } from '@mui/material';
// import Image, { ImageProps } from 'next/image';

interface ImageProps extends React.ComponentPropsWithoutRef<'img'> {
  alt?: string;
  sx?: SxProps
}

const customImage = ({ alt = '', ...props }: ImageProps) => (
  <img {...props} alt={alt} />
);

export default customImage;
