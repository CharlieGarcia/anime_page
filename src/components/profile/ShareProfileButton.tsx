import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

type ShareProfileButtonProps = {
  username: string;
  displayName: string;
};

// Opens the device's share sheet for a public profile, or copies its link
// where the browser has no share sheet (most desktop browsers)
const ShareProfileButton = ({
  username,
  displayName
}: ShareProfileButtonProps) => {
  const [status, setStatus] = useState('');

  const share = async () => {
    const url = `${window.location.origin}/users/${encodeURIComponent(username)}`;
    setStatus('');

    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, url });
        return;
      } catch (error) {
        // The user closed the share sheet
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        // Any other failure falls back to copying the link
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus('Link copied');
    } catch {
      setStatus(`Could not copy the link. The address is ${url}`);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '16px'
      }}>
      <Button variant="outlined" startIcon={<ShareIcon />} onClick={share}>
        Share profile
      </Button>
      <Typography role="status" color="text.secondary">
        {status}
      </Typography>
    </Box>
  );
};

export default ShareProfileButton;
