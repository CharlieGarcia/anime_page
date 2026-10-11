import React from 'react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Box, Button } from '@mui/material';

// Sign in / Sign up when signed out, the account menu when signed in.
// The auth state is only known in the browser, so the box keeps a fixed size
// and the header does not move when the controls appear.
export const AuthControls = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      minWidth: { xs: '84px', sm: '184px' },
      minHeight: '37px'
    }}>
    <Show when="signed-out">
      <SignInButton mode="modal">
        <Button variant="outlined">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button
          variant="contained"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          Sign up
        </Button>
      </SignUpButton>
    </Show>
    <Show when="signed-in">
      <UserButton />
    </Show>
  </Box>
);
