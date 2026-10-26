import React from 'react';
import Link from 'next/link';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Typography } from '@mui/material';
import { Layout } from '@/components/layout';
import LoadingSpinner from '@/components/loadingSpinner';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileSummary from '@/components/profile/ProfileSummary';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import { meQuery } from '@/helpers/apiQueries';

const OwnProfile = () => {
  const { data: profile, error } = useQuery(meQuery());

  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!profile) return <LoadingSpinner />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <ProfileSummary profile={profile} />
      {profile.username ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <Button
            component={Link}
            href={`/users/${profile.username}`}
            variant="outlined">
            View public profile
          </Button>
          <ShareProfileButton
            username={profile.username}
            displayName={profile.displayName}
          />
        </Box>
      ) : (
        <Alert severity="info">
          Choose a username to get a public profile page.
        </Alert>
      )}
      <Box>
        <Typography variant="h5" component="h2" sx={{ marginBottom: '16px' }}>
          Edit profile
        </Typography>
        {/* Remount when the saved profile changes so the form starts from it */}
        <ProfileForm profile={profile} key={profile.id} />
      </Box>
    </Box>
  );
};

const ProfilePage = () => {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <Layout>
      {!isLoaded ? (
        <LoadingSpinner />
      ) : isSignedIn ? (
        <OwnProfile />
      ) : (
        <Box>
          <Typography variant="h4" component="h1" sx={{ marginBottom: '16px' }}>
            Your profile
          </Typography>
          <Typography sx={{ marginBottom: '16px' }}>
            Sign in to see and edit your profile.
          </Typography>
          <SignInButton mode="modal">
            <Button variant="contained">Sign in</Button>
          </SignInButton>
        </Box>
      )}
    </Layout>
  );
};

export default ProfilePage;
