import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, FormControlLabel, Switch } from '@mui/material';
import { meQuery, updateProfile } from '@/helpers/apiQueries';
import type { ProfileChanges } from '@/types';

// The profile settings that say whether a list shows on the public profile
type VisibilitySetting = {
  [Key in keyof ProfileChanges]-?: NonNullable<
    ProfileChanges[Key]
  > extends boolean
    ? Key
    : never;
}[keyof ProfileChanges];

type PrivacySwitchProps = {
  setting: VisibilitySetting;
  label: string;
};

// Whether one of the signed-in user's lists shows on their public profile
const PrivacySwitch = ({ setting, label }: PrivacySwitchProps) => {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(meQuery());
  const { mutate, isPending, variables, error } = useMutation({
    mutationFn: (visible: boolean) => updateProfile({ [setting]: visible }),
    onSuccess: (saved) => {
      queryClient.setQueryData(meQuery().queryKey, saved);
      // The public profile and its lists read this setting
      if (saved.username) {
        queryClient.invalidateQueries({ queryKey: ['users', saved.username] });
      }
    }
  });

  if (!profile) return null;

  // Show the new position while it saves
  const checked = isPending ? variables : profile[setting];

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
        label={label}
      />
      {error && (
        <Alert severity="error">
          Couldn&apos;t save this setting: {error.message}
        </Alert>
      )}
    </Box>
  );
};

export default PrivacySwitch;
