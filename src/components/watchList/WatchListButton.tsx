import React from 'react';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Snackbar, SxProps, Theme } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import {
  addToWatchListMutation,
  myWatchListQuery,
  removeFromWatchListMutation,
  type WatchListAnime
} from '@/helpers/apiQueries';
import { WatchListItem } from '@/types';

type WatchListButtonProps = {
  anime: WatchListAnime;
};

const ADD_LABEL = 'Add to watch list';
const REMOVE_LABEL = 'Remove from watch list';

// The same size in every state (loading, signed out, in the list or not), so nothing
// moves when the auth state and the list arrive in the browser
const buttonSx: SxProps<Theme> = {
  width: '232px',
  height: '37px',
  whiteSpace: 'nowrap'
};

// The ids on the list, for a quick "is it there?" check
const toIds = (items: WatchListItem[]) =>
  new Set(items.map((item) => item.animeId));

const SignedInWatchListButton = ({ anime }: WatchListButtonProps) => {
  const queryClient = useQueryClient();
  const { data: ids } = useQuery({ ...myWatchListQuery(), select: toIds });
  const add = useMutation(addToWatchListMutation(queryClient));
  const remove = useMutation(removeFromWatchListMutation(queryClient));

  const isOnList = ids?.has(anime.animeId) ?? false;
  const error = add.error
    ? `Couldn't add ${anime.title}: ${add.error.message}`
    : remove.error
      ? `Couldn't remove ${anime.title}: ${remove.error.message}`
      : null;

  const toggle = () => {
    add.reset();
    remove.reset();
    if (isOnList) remove.mutate(anime);
    else add.mutate(anime);
  };

  return (
    <>
      <Button
        variant={isOnList ? 'contained' : 'outlined'}
        startIcon={isOnList ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        onClick={toggle}
        // Wait for the list, and for the last click to finish, before taking another
        disabled={!ids || add.isPending || remove.isPending}
        sx={buttonSx}>
        {isOnList ? REMOVE_LABEL : ADD_LABEL}
      </Button>
      <Snackbar
        open={Boolean(error)}
        onClose={() => {
          add.reset();
          remove.reset();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

// Adds the anime to the signed-in user's watch list, or removes it if it's there.
// Signed-out visitors get the sign-in modal. The auth state is only known in the
// browser, so statically generated pages can use it.
const WatchListButton = ({ anime }: WatchListButtonProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <Button
        variant="outlined"
        startIcon={<BookmarkBorderIcon />}
        disabled
        sx={buttonSx}>
        {ADD_LABEL}
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button
          variant="outlined"
          startIcon={<BookmarkBorderIcon />}
          sx={buttonSx}>
          {ADD_LABEL}
        </Button>
      </SignInButton>
    );
  }

  return <SignedInWatchListButton anime={anime} />;
};

export default WatchListButton;
