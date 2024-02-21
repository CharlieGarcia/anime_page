import React from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

const AnimeCard = ({ id, attributes }) => {
  const {
    subtype = '',
    titles = {},
    posterImage = {},
    episodeCount = '',
    episodeLength = ''
  } = attributes;
  const {
    en: englishTitle = '',
    en_jp: enGlishJapaneseTitle = 'N/A',
    ja_jp: titleRomaji = 'N/A'
  } = titles;
  const { small: posterImageUrl } = posterImage;
  const titleEnglish = englishTitle || enGlishJapaneseTitle;

  return (
    <Link style={{ textDecoration: 'none' }} href={`/details/${id}`}>
      <Card sx={{ maxWidth: '284px' }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height={402}
            image={posterImageUrl}
            alt=""
          />
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
    </Link>
  );
};

export default AnimeCard;
