import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography
} from '@mui/material';
import Image from '@/components/image';
import type { AnimeSnapshot } from '@/helpers/animeSnapshot';

// Kitsu posters are 284x402 (small) and 550x780 (large)
const POSTER_RATIO = '284 / 402';

// Card width in a PosterGrid (columns at least 140px wide): two on phones,
// around 200px on wider screens
const POSTER_SIZES = '(max-width: 600px) 50vw, (max-width: 900px) 33vw, 220px';

// What a card shows: a stored snapshot, so lists render without calling Kitsu
export type PosterAnime = AnimeSnapshot & { animeId: string };

type PosterCardProps = {
  anime: PosterAnime;
  // Position in a ranked list, shown over the poster
  rank?: number;
  // Buttons shown under the card, outside its link
  action?: React.ReactNode;
};

// Poster, title and subtype, linking to the details page. Renders a list item, so it
// goes in a <ul> or <ol>. Slimmer than AnimeCard, which needs the full Kitsu record.
const PosterCard = ({ anime, rank, action }: PosterCardProps) => (
  <Card
    component="li"
    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardActionArea
      component={Link}
      href={`/details/${anime.animeId}`}
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
      }}>
      <Box sx={{ position: 'relative' }}>
        {anime.posterUrl ? (
          <Image
            src={anime.posterUrl}
            // The title is in the card text, so the poster adds nothing for screen readers
            alt=""
            aspectRatio={POSTER_RATIO}
            sizes={POSTER_SIZES}
          />
        ) : (
          <Box
            sx={{ aspectRatio: POSTER_RATIO, bgcolor: 'action.hover' }}
            aria-hidden
          />
        )}
        {rank !== undefined && (
          <Typography
            component="span"
            variant="subtitle1"
            sx={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              minWidth: '32px',
              height: '32px',
              paddingX: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 700,
              boxShadow: 2
            }}>
            {rank}
          </Typography>
        )}
      </Box>
      <CardContent>
        <Typography variant="subtitle1" component="h3">
          {anime.title}
        </Typography>
        {anime.subtype && (
          <Typography variant="body2" color="text.secondary">
            {anime.subtype}
          </Typography>
        )}
      </CardContent>
    </CardActionArea>
    {action && <CardActions>{action}</CardActions>}
  </Card>
);

export default PosterCard;
