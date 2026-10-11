import React from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Box, CardActionArea } from '@mui/material';
import Image from './image';
import { Anime } from '@/types';

export type AnimeCardProps = Anime & {
  // Load the poster straight away; for cards visible when the page opens
  eagerImage?: boolean;
};

// Card width in the anime grid: one column on phones, up to four on desktop
const POSTER_SIZES =
  '(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 256px';

const AnimeCard = ({
  id,
  attributes,
  eagerImage = false
}: AnimeCardProps): JSX.Element => {
  const { subtype, titles, posterImage, episodeCount, episodeLength } =
    attributes;
  const titleRomaji = titles.ja_jp || 'N/A';
  const titleEnglish = titles.en || titles.en_jp || 'N/A';
  const posterImageUrl = posterImage?.large || posterImage?.small;

  return (
    <Box
      component={Link}
      href={`/details/${id}`}
      sx={{ textDecoration: 'none' }}>
      <Card sx={{ height: '100%' }}>
        <CardActionArea>
          {posterImageUrl && (
            <Image
              src={posterImageUrl}
              alt={titleEnglish}
              // Kitsu posters are 284x402 (small) and 550x780 (large)
              aspectRatio="284 / 402"
              sizes={POSTER_SIZES}
              eager={eagerImage}
            />
          )}
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Japanese Title: {titleRomaji}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              English Title: {titleEnglish}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Episodes: {episodeCount || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SubType: {subtype}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Episode Length in minutes: {episodeLength || 'N/A'}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default AnimeCard;
