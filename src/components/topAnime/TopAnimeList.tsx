import React from 'react';
import { Typography } from '@mui/material';
import PosterCard, {
  type PosterAnime
} from '@/components/posterCard/PosterCard';
import PosterGrid from '@/components/posterCard/PosterGrid';

type TopAnimeListProps = {
  // In rank order, best first
  items: PosterAnime[];
  // Shown instead of the list when there are no items
  emptyMessage: React.ReactNode;
  // Controls for one row, such as Move up; leave out for a read-only list
  renderAction?: (item: PosterAnime, index: number) => React.ReactNode;
};

// A numbered list of poster cards, each showing its rank. Knows nothing about whose
// list it is; TopAnimeEditor and PublicTopAnime wrap it.
const TopAnimeList = ({
  items,
  emptyMessage,
  renderAction
}: TopAnimeListProps) => {
  if (items.length === 0) {
    return <Typography color="text.secondary">{emptyMessage}</Typography>;
  }

  return (
    <PosterGrid ordered>
      {items.map((item, index) => (
        <PosterCard
          key={item.animeId}
          anime={item}
          rank={index + 1}
          action={renderAction?.(item, index)}
        />
      ))}
    </PosterGrid>
  );
};

export default TopAnimeList;
