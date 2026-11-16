import React from 'react';
import { Typography } from '@mui/material';
import PosterCard from '@/components/posterCard/PosterCard';
import PosterGrid from '@/components/posterCard/PosterGrid';
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
    <PosterGrid>
      {items.map((item) => (
        <PosterCard
          key={item.animeId}
          anime={item}
          action={renderAction?.(item)}
        />
      ))}
    </PosterGrid>
  );
};

export default WatchListGrid;
