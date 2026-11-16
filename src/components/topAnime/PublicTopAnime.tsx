import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Typography } from '@mui/material';
import LoadingSpinner from '@/components/loadingSpinner';
import TopAnimeList from './TopAnimeList';
import { ApiError, userTopAnimeQuery } from '@/helpers/apiQueries';

type PublicTopAnimeProps = {
  username: string;
  // From the public profile; a private list isn't requested at all
  topAnimePublic: boolean;
};

// Anyone's top 10 on /users/[username]: read-only, signed in or not
const PublicTopAnime = ({ username, topAnimePublic }: PublicTopAnimeProps) => {
  const { data: items, error } = useQuery({
    ...userTopAnimeQuery(username),
    enabled: topAnimePublic
  });

  // The server also says 403 if the owner made it private after the profile loaded
  const isPrivate =
    !topAnimePublic || (error instanceof ApiError && error.status === 403);
  if (isPrivate) {
    return (
      <Typography color="text.secondary">
        @{username} keeps their top 10 private.
      </Typography>
    );
  }
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!items) return <LoadingSpinner />;

  return (
    <TopAnimeList
      items={items}
      emptyMessage={`@${username} hasn't picked a top 10 yet.`}
    />
  );
};

export default PublicTopAnime;
