import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Typography } from '@mui/material';
import { Layout } from '@/components/layout';
import LoadingSpinner from '@/components/loadingSpinner';
import ProfileSummary from '@/components/profile/ProfileSummary';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import { ApiError, userQuery } from '@/helpers/apiQueries';

type PublicProfileProps = {
  username: string;
};

const PublicProfile = ({ username }: PublicProfileProps) => {
  const { data: profile, error } = useQuery(userQuery(username));

  if (error instanceof ApiError && error.status === 404) {
    return (
      <>
        <Typography variant="h4" component="h1" sx={{ marginBottom: '16px' }}>
          User not found
        </Typography>
        <Typography>There is no user called @{username}.</Typography>
      </>
    );
  }
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!profile) return <LoadingSpinner />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <ProfileSummary profile={profile} />
      {profile.username && (
        <ShareProfileButton
          username={profile.username}
          displayName={profile.displayName}
        />
      )}
    </Box>
  );
};

const PublicProfilePage = () => {
  const { query, isReady } = useRouter();
  const username = typeof query.username === 'string' ? query.username : '';

  return (
    <Layout>
      {isReady && username ? (
        <PublicProfile username={username} />
      ) : (
        <LoadingSpinner />
      )}
    </Layout>
  );
};

export default PublicProfilePage;
