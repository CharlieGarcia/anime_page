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
import { WatchListItem } from '@/types';

// Kitsu posters are 284x402 (small) and 550x780 (large)
const POSTER_RATIO = '284 / 402';

// Card width in the watch list grid (columns at least 140px wide): two on phones,
// around 200px on wider screens
const POSTER_SIZES = '(max-width: 600px) 50vw, (max-width: 900px) 33vw, 220px';

type WatchListCardProps = {
  item: WatchListItem;
  // Buttons shown under the card, outside its link
  action?: React.ReactNode;
};

// Poster, title and subtype from the item's snapshot, linking to the details page.
// Slimmer than AnimeCard, which needs the full Kitsu record.
const WatchListCard = ({ item, action }: WatchListCardProps) => (
  <Card
    component="li"
    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardActionArea
      component={Link}
      href={`/details/${item.animeId}`}
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start'
      }}>
      {item.posterUrl ? (
        <Image
          src={item.posterUrl}
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
      <CardContent>
        <Typography variant="subtitle1" component="h3">
          {item.title}
        </Typography>
        {item.subtype && (
          <Typography variant="body2" color="text.secondary">
            {item.subtype}
          </Typography>
        )}
      </CardContent>
    </CardActionArea>
    {action && <CardActions>{action}</CardActions>}
  </Card>
);

export default WatchListCard;
