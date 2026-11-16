import React from 'react';
import { IconButton, SxProps, Theme } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import WatchListToggle from './WatchListToggle';
import type { WatchListAnime } from '@/helpers/apiQueries';

type WatchListIconButtonProps = {
  anime: WatchListAnime;
  sx?: SxProps<Theme>;
};

// A bookmark icon button for anime cards, drawn over the poster. Its label names the
// anime, since a page has one per card. 40x40 in every state, so nothing moves when
// the auth state and the list arrive in the browser.
const WatchListIconButton = ({ anime, sx = [] }: WatchListIconButtonProps) => (
  <WatchListToggle anime={anime}>
    {({ isOnList, disabled, onClick }) => (
      <IconButton
        onClick={onClick}
        disabled={disabled}
        aria-label={
          isOnList
            ? `Remove ${anime.title} from watch list`
            : `Add ${anime.title} to watch list`
        }
        sx={[
          {
            width: 40,
            height: 40,
            // A dark backdrop keeps the icon visible on any poster, in either theme
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.6)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }
          },
          ...(Array.isArray(sx) ? sx : [sx])
        ]}>
        {isOnList ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </IconButton>
    )}
  </WatchListToggle>
);

export default WatchListIconButton;
