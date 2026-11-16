import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button } from '@mui/material';
import LoadingSpinner from '@/components/loadingSpinner';
import WatchListGrid from './WatchListGrid';
import {
  meQuery,
  myWatchListQuery,
  removeFromWatchListMutation
} from '@/helpers/apiQueries';

// The signed-in user's watch list on /profile, with a Remove button on each card
const OwnWatchList = () => {
  const queryClient = useQueryClient();
  const { data: items, error } = useQuery(myWatchListQuery());
  const { data: profile } = useQuery(meQuery());
  const remove = useMutation(removeFromWatchListMutation(queryClient));

  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!items) return <LoadingSpinner />;

  const emptyMessage = [
    'Your watch list is empty. Add anime from any details page or card.',
    profile?.watchListPublic === false && 'Only you can see it.'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {remove.isError && (
        <Alert severity="error" onClose={() => remove.reset()}>
          Couldn&apos;t remove {remove.variables?.title}: {remove.error.message}
        </Alert>
      )}
      <WatchListGrid
        items={items}
        emptyMessage={emptyMessage}
        renderAction={(item) => (
          <Button
            size="small"
            color="error"
            onClick={() => remove.mutate(item)}
            aria-label={`Remove ${item.title} from watch list`}>
            Remove
          </Button>
        )}
      />
    </Box>
  );
};

export default OwnWatchList;
