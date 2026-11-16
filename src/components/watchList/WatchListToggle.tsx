import React from 'react';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Snackbar } from '@mui/material';
import {
  addToWatchListMutation,
  myWatchListQuery,
  removeFromWatchListMutation,
  type WatchListAnime
} from '@/helpers/apiQueries';
import { WatchListItem } from '@/types';

// What a watch list button needs to draw itself
export type WatchListToggleState = {
  isOnList: boolean;
  disabled: boolean;
  // Absent while signed out: the sign-in modal adds its own click handler
  onClick?: () => void;
};

type WatchListToggleProps = {
  anime: WatchListAnime;
  // Draws the button; WatchListButton and WatchListIconButton each pass their own
  children: (state: WatchListToggleState) => React.ReactElement;
};

// The ids on the list, for a quick "is it there?" check. Every button on a page reads
// the same cached list, so a page of cards makes one request.
const toIds = (items: WatchListItem[]) =>
  new Set(items.map((item) => item.animeId));

const SignedInToggle = ({ anime, children }: WatchListToggleProps) => {
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
  const clearError = () => {
    add.reset();
    remove.reset();
  };

  const toggle = () => {
    clearError();
    if (isOnList) remove.mutate(anime);
    else add.mutate(anime);
  };

  return (
    <>
      {children({
        isOnList,
        // Wait for the list, and for the last click to finish, before taking another
        disabled: !ids || add.isPending || remove.isPending,
        onClick: toggle
      })}
      <Snackbar
        open={Boolean(error)}
        onClose={clearError}
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
// browser, so statically generated pages can use it; until then the button is disabled.
const WatchListToggle = ({ anime, children }: WatchListToggleProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return children({ isOnList: false, disabled: true });

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        {children({ isOnList: false, disabled: false })}
      </SignInButton>
    );
  }

  return <SignedInToggle anime={anime}>{children}</SignedInToggle>;
};

export default WatchListToggle;
