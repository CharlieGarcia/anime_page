import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, FormControlLabel, Switch } from '@mui/material';
import { meQuery, updateProfile } from '@/helpers/apiQueries';

// Whether the signed-in user's watch list shows on their public profile
const WatchListPrivacySwitch = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(meQuery());
  const { mutate, isPending, variables, error } = useMutation({
    mutationFn: (watchListPublic: boolean) =>
      updateProfile({ watchListPublic }),
    onSuccess: (saved) => {
      queryClient.setQueryData(meQuery().queryKey, saved);
      // The public profile and its list read this setting
      if (saved.username) {
        queryClient.invalidateQueries({ queryKey: ['users', saved.username] });
      }
    }
  });

  if (!profile) return null;

  // Show the new position while it saves
  const checked = isPending ? variables : profile.watchListPublic;

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(event) => mutate(event.target.checked)}
            disabled={isPending}
          />
        }
        label="Show my watch list on my public profile"
      />
      {error && (
        <Alert severity="error">
          Couldn&apos;t save this setting: {error.message}
        </Alert>
      )}
    </Box>
  );
};

export default WatchListPrivacySwitch;
