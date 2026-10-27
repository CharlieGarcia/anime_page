import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { PublicProfile } from '@/types';

type ProfileSummaryProps = {
  profile: PublicProfile;
};

// Avatar, name, username, bio and join date; shared by the own and public profile pages
const ProfileSummary = ({ profile }: ProfileSummaryProps) => {
  const { displayName, username, avatarUrl, bio, createdAt } = profile;
  const joined = new Date(createdAt).toLocaleDateString('en', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  });

  return (
    <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <Avatar
        src={avatarUrl || undefined}
        alt=""
        sx={{ width: 96, height: 96 }}
      />
      <Box>
        <Typography variant="h4" component="h1">
          {displayName}
        </Typography>
        {username && (
          <Typography color="text.secondary">@{username}</Typography>
        )}
        <Typography color="text.secondary">Joined {joined}</Typography>
        {bio && (
          <Typography sx={{ marginTop: '16px', whiteSpace: 'pre-line' }}>
            {bio}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProfileSummary;
