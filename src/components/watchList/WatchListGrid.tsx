import React from 'react';
import { Box, Typography } from '@mui/material';
import WatchListCard from './WatchListCard';
import { WatchListItem } from '@/types';

type WatchListGridProps = {
  items: WatchListItem[];
  // Shown instead of the grid when there are no items
  emptyMessage: React.ReactNode;
  // Controls for one card, such as a Remove button; leave out for a read-only list
  renderAction?: (item: WatchListItem) => React.ReactNode;
};

// Lays out watch list cards, or the empty message. Knows nothing about whose list it is;
// OwnWatchList and PublicWatchList wrap it.
const WatchListGrid = ({
  items,
  emptyMessage,
  renderAction
}: WatchListGridProps) => {
  if (items.length === 0) {
    return <Typography color="text.secondary">{emptyMessage}</Typography>;
  }

  return (
    <Box
      component="ul"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '24px',
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
      {items.map((item) => (
        <WatchListCard
          key={item.animeId}
          item={item}
          action={renderAction?.(item)}
        />
      ))}
    </Box>
  );
};

export default WatchListGrid;
