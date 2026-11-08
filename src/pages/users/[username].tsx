import React from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import {
  dehydrate,
  useQuery,
  type DehydratedState
} from '@tanstack/react-query';
import { Alert, Box, Typography } from '@mui/material';
import { Layout } from '@/components/layout';
import LoadingSpinner from '@/components/loadingSpinner';
import ProfileSummary from '@/components/profile/ProfileSummary';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import { ApiError, userQuery } from '@/helpers/apiQueries';
import { profileMeta } from '@/helpers/profileMeta';
import { makeQueryClient } from '@/helpers/queryClient';
import { getDb } from '@/server/db/client';
import { siteOrigin } from '@/server/siteOrigin';
import { getUserByUsername, toPublicProfile } from '@/server/users';
import type { PublicProfile as PublicProfileData } from '@/types';

type PublicProfilePageProps = {
  username: string;
  found: boolean;
  // Absolute address of this profile, for og:url
  url: string;
  // Read by _app.tsx to fill the query cache
  dehydratedState?: DehydratedState;
};

const NotFound = ({ username }: { username: string }) => (
  <>
    <Head>
      <title>User not found</title>
    </Head>
    <Typography variant="h4" component="h1" sx={{ marginBottom: '16px' }}>
      User not found
    </Typography>
    <Typography>There is no user called @{username}.</Typography>
  </>
);

// Title, description and the Open Graph / Twitter tags link previews read
const ProfileHead = ({
  profile,
  url
}: {
  profile: PublicProfileData;
  url: string;
}) => {
  const { title, description, image } = profileMeta(profile);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary" />
    </Head>
  );
};

const PublicProfile = ({ username, url }: PublicProfilePageProps) => {
  // Filled from the server render; refetched in the browser like any other query
  const { data: profile, error } = useQuery(userQuery(username));

  if (error instanceof ApiError && error.status === 404) {
    return <NotFound username={username} />;
  }
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!profile) return <LoadingSpinner />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <ProfileHead profile={profile} url={url} />
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

const PublicProfilePage = (props: PublicProfilePageProps) => (
  <Layout>
    {props.found ? (
      <PublicProfile {...props} />
    ) : (
      <NotFound username={props.username} />
    )}
  </Layout>
);

// Rendered on every request, so link-preview crawlers (which don't run JavaScript)
// get the profile and its tags in the HTML, and edits show up straight away.
export const getServerSideProps: GetServerSideProps<
  PublicProfilePageProps
> = async ({ params, req, res }) => {
  const username = String(params?.username ?? '');
  const user = await getUserByUsername(getDb(), username);

  if (!user) {
    // Keep this page's "User not found" message rather than the generic 404 page
    res.statusCode = 404;
    return { props: { username, found: false, url: '' } };
  }

  // Same shape as GET /api/users/[username] returns (dates as strings)
  const profile: PublicProfileData = {
    ...toPublicProfile(user),
    createdAt: user.createdAt.toISOString()
  };
  const queryClient = makeQueryClient();
  queryClient.setQueryData(userQuery(username).queryKey, profile);

  return {
    props: {
      username,
      found: true,
      url: `${siteOrigin(req)}/users/${encodeURIComponent(profile.username ?? username)}`,
      dehydratedState: dehydrate(queryClient)
    }
  };
};

export default PublicProfilePage;
