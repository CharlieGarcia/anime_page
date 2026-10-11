import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, TextField } from '@mui/material';
import { ApiError, meQuery, updateProfile } from '@/helpers/apiQueries';
import { Profile } from '@/types';

type ProfileFormProps = {
  profile: Profile;
};

const ProfileForm = ({ profile }: ProfileFormProps) => {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState({
    displayName: profile.displayName,
    username: profile.username ?? '',
    bio: profile.bio
  });
  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (saved) => {
      queryClient.setQueryData(meQuery().queryKey, saved);
      setFields({
        displayName: saved.displayName,
        username: saved.username ?? '',
        bio: saved.bio
      });
    }
  });
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  // A message that does not belong under one of the fields
  const formError =
    error && Object.keys(fieldErrors).length === 0 ? error.message : null;

  const updateField =
    (name: keyof typeof fields) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      reset();
      setFields((current) => ({ ...current, [name]: event.target.value }));
    };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, ...rest } = fields;
    // An empty username means "not chosen yet", so it is left out
    mutate(username.trim() ? { ...rest, username } : rest);
  };

  return (
    <Box
      component="form"
      onSubmit={save}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '480px'
      }}>
      <TextField
        label="Display name"
        name="displayName"
        value={fields.displayName}
        onChange={updateField('displayName')}
        error={Boolean(fieldErrors.displayName)}
        helperText={fieldErrors.displayName}
        required
      />
      <TextField
        label="Username"
        name="username"
        value={fields.username}
        onChange={updateField('username')}
        error={Boolean(fieldErrors.username)}
        helperText={
          fieldErrors.username ||
          '3 to 20 letters, numbers or underscores. Friends find you by it.'
        }
        autoComplete="off"
      />
      <TextField
        label="Bio"
        name="bio"
        value={fields.bio}
        onChange={updateField('bio')}
        error={Boolean(fieldErrors.bio)}
        helperText={fieldErrors.bio}
        multiline
        minRows={3}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save profile'}
        </Button>
        <Box role="status" aria-live="polite">
          {isSuccess && <Alert severity="success">Profile saved</Alert>}
        </Box>
      </Box>
      {formError && <Alert severity="error">{formError}</Alert>}
    </Box>
  );
};

export default ProfileForm;
