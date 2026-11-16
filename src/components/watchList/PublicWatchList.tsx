import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Typography } from '@mui/material';
import LoadingSpinner from '@/components/loadingSpinner';
import WatchListGrid from './WatchListGrid';
import { ApiError, userWatchListQuery } from '@/helpers/apiQueries';

type PublicWatchListProps = {
  username: string;
  // From the public profile; a private list isn't requested at all
  watchListPublic: boolean;
};

// Anyone's watch list on /users/[username]: read-only, signed in or not
const PublicWatchList = ({
  username,
  watchListPublic
}: PublicWatchListProps) => {
  const { data: items, error } = useQuery({
    ...userWatchListQuery(username),
    enabled: watchListPublic
  });

  // The server also says 403 if the owner made it private after the profile loaded
  const isPrivate =
    !watchListPublic || (error instanceof ApiError && error.status === 403);
  if (isPrivate) {
    return (
      <Typography color="text.secondary">
        @{username} keeps their watch list private.
      </Typography>
    );
  }
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!items) return <LoadingSpinner />;

  return (
    <WatchListGrid
      items={items}
      emptyMessage={`@${username} hasn't added anything yet.`}
    />
  );
};

export default PublicWatchList;
