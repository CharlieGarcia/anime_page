import React from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box, CardActionArea } from '@mui/material';
import { Anime } from '@/types';

export type AnimeCardProps = Anime;

const AnimeCard = ({ id, attributes }: AnimeCardProps): JSX.Element => {
  const { subtype, titles, posterImage, episodeCount, episodeLength } =
    attributes;
  const titleRomaji = titles.ja_jp || 'N/A';
  const titleEnglish = titles.en || titles.en_jp || 'N/A';
  const posterImageUrl = posterImage?.small;

  return (
    <Box
      component={Link}
      href={`/details/${id}`}
      sx={{ textDecoration: 'none' }}>
      <Card sx={{ height: '100%' }}>
        <CardActionArea>
          {posterImageUrl && (
            <CardMedia
              component="img"
              // Kitsu's small poster is 284x402; keep that shape at any card width
              sx={{ aspectRatio: '284 / 402' }}
              image={posterImageUrl}
              alt={titleEnglish}
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
