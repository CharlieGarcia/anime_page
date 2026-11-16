import React from 'react';
import Link from 'next/link';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  SxProps,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  addToTopAnimeMutation,
  myTopAnimeQuery,
  removeFromTopAnimeMutation,
  type TopAnimeAnime
} from '@/helpers/apiQueries';
import { TOP_ANIME_MAX } from '@/constants';

type TopAnimeButtonProps = {
  anime: TopAnimeAnime;
};

// The same box in every state (loading, signed out, in the list, not in it, full), so
// nothing on the details page moves when the auth state and the list arrive. The
// longest state, "Your top 10 is full" and its link, needs 255px.
const box: SxProps = {
  display: 'flex',
  gap: '8px',
  width: '264px',
  height: '37px'
};
const fill: SxProps = { flex: 1, whiteSpace: 'nowrap' };

const AddButton = ({
  disabled,
  onClick
}: {
  disabled: boolean;
  onClick?: () => void;
}) => (
  <Button
    variant="outlined"
    startIcon={<StarBorderIcon />}
    onClick={onClick}
    disabled={disabled}
    sx={fill}>
    Add to top 10
  </Button>
);

const SignedInButton = ({ anime }: TopAnimeButtonProps) => {
  const queryClient = useQueryClient();
  const { data: items } = useQuery(myTopAnimeQuery());
  const add = useMutation(addToTopAnimeMutation(queryClient));
  const remove = useMutation(removeFromTopAnimeMutation(queryClient));

  const item = items?.find((entry) => entry.animeId === anime.animeId);
  const isFull = (items?.length ?? 0) >= TOP_ANIME_MAX;
  const error = add.error
    ? `Couldn't add ${anime.title}: ${add.error.message}`
    : remove.error
      ? `Couldn't remove ${anime.title}: ${remove.error.message}`
      : null;
  const clearError = () => {
    add.reset();
    remove.reset();
  };
  // Wait for the list, and for the last click to finish, before taking another
  const busy = !items || add.isPending || remove.isPending;

  let button: React.ReactElement;
  if (item) {
    button = (
      <Button
        variant="contained"
        startIcon={<StarIcon />}
        title="Remove from your top 10"
        onClick={() => {
          clearError();
          remove.mutate(anime);
        }}
        disabled={busy}
        sx={fill}>
        #{item.rank} in your top 10
      </Button>
    );
  } else if (items && isFull) {
    button = (
      <>
        <Button
          variant="outlined"
          startIcon={<StarBorderIcon />}
          disabled
          sx={fill}>
          Your top 10 is full
        </Button>
        {/* An icon, so the message and the link fit the same box as the other states */}
        <Tooltip title="Make room on your profile">
          <IconButton
            component={Link}
            href="/profile"
            aria-label="Make room on your profile"
            color="primary"
            sx={{ width: '37px', height: '37px' }}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </>
    );
  } else {
    button = (
      <AddButton
        disabled={busy}
        onClick={() => {
          clearError();
          add.mutate(anime);
        }}
      />
    );
  }

  return (
    <>
      <Box sx={box}>{button}</Box>
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

// "Add to top 10", or the anime's rank once it's in the signed-in user's top 10 (a
// click then removes it). With 10 already in the list it's disabled, with a link to
// /profile to make room. Signed-out visitors get the sign-in modal. The auth state is
// only known in the browser, so the statically generated page shows a disabled
// button until Clerk has loaded.
const TopAnimeButton = ({ anime }: TopAnimeButtonProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <Box sx={box}>
        <AddButton disabled />
      </Box>
    );
  }

  if (!isSignedIn) {
    return (
      <Box sx={box}>
        <SignInButton mode="modal">
          <AddButton disabled={false} />
        </SignInButton>
      </Box>
    );
  }

  return <SignedInButton anime={anime} />;
};

export default TopAnimeButton;
