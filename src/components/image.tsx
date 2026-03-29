import React from 'react';
import Image, { ImageProps } from 'next/image';

const customImage = ({ alt = '', ...props }: ImageProps) => <Image {...props} alt={alt} />;

export default customImage;
