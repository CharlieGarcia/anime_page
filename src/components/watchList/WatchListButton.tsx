import React from 'react';
import { Button } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import WatchListToggle from './WatchListToggle';
import type { WatchListAnime } from '@/helpers/apiQueries';

type WatchListButtonProps = {
  anime: WatchListAnime;
};

// "Add to watch list" / "Remove from watch list" with a bookmark icon, for the details page.
// The same size in every state (loading, signed out, in the list or not), so nothing
// moves when the auth state and the list arrive in the browser.
const WatchListButton = ({ anime }: WatchListButtonProps) => (
  <WatchListToggle anime={anime}>
    {({ isOnList, disabled, onClick }) => (
      <Button
        variant={isOnList ? 'contained' : 'outlined'}
        startIcon={isOnList ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        onClick={onClick}
        disabled={disabled}
        sx={{ width: '232px', height: '37px', whiteSpace: 'nowrap' }}>
        {isOnList ? 'Remove from watch list' : 'Add to watch list'}
      </Button>
    )}
  </WatchListToggle>
);

export default WatchListButton;
