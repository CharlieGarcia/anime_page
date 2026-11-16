import React, { useLayoutEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, IconButton, Tooltip } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import LoadingSpinner from '@/components/loadingSpinner';
import type { PosterAnime } from '@/components/posterCard/PosterCard';
import TopAnimeList from './TopAnimeList';
import TopAnimeSearch from './TopAnimeSearch';
import {
  meQuery,
  myTopAnimeQuery,
  saveTopAnimeMutation
} from '@/helpers/apiQueries';
import { TOP_ANIME_MAX } from '@/constants';

// Keeps the announcements available to screen readers without showing them
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0
} as const;

type RowControl = 'up' | 'down' | 'remove';

// Where focus goes once the list has re-rendered after a change
type FocusTarget =
  | { animeId: string; control: RowControl }
  // 'start' is the search box, or the first row while the list is full
  | { to: 'search' | 'save' | 'start' };

const sameOrder = (a: PosterAnime[], b: PosterAnime[]) =>
  a.length === b.length && a.every((item, i) => item.animeId === b[i].animeId);

// The signed-in user's top 10 on /profile. Adding, moving and removing change a local
// draft; nothing is sent until Save, and Cancel goes back to the saved list.
const TopAnimeEditor = () => {
  const queryClient = useQueryClient();
  const { data: saved, error } = useQuery(myTopAnimeQuery());
  const { data: profile } = useQuery(meQuery());
  const save = useMutation(saveTopAnimeMutation(queryClient));

  const [draft, setDraft] = useState<PosterAnime[] | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const searchInput = useRef<HTMLInputElement>(null);
  const saveButton = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<FocusTarget | null>(null);

  // A draft with no changes in it follows the saved list, so additions from elsewhere
  // on the page (such as a details page button) show up straight away
  const hasChanges = Boolean(draft && saved && !sameOrder(draft, saved));
  const items = hasChanges ? draft! : (saved ?? []);
  const full = items.length >= TOP_ANIME_MAX;

  // Moving or removing a row re-renders the buttons; put focus back where the user
  // expects it
  useLayoutEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    focusTarget.current = null;

    if ('to' in target) {
      if (target.to === 'save') return saveButton.current?.focus();
      const search = searchInput.current;
      if (target.to === 'search' || (search && !search.disabled)) {
        return search?.focus();
      }
    }
    const { animeId, control } =
      'to' in target
        ? { animeId: items[0]?.animeId, control: 'down' as const }
        : target;
    const button = buttons.current.get(`${animeId}:${control}`);
    // A row moved to the top or bottom has its Move up or Move down disabled
    const other = buttons.current.get(
      `${animeId}:${control === 'up' ? 'down' : 'up'}`
    );
    (button && !button.disabled ? button : other)?.focus();
  });

  const buttonRef =
    (animeId: string, control: RowControl) =>
    (button: HTMLButtonElement | null) => {
      const key = `${animeId}:${control}`;
      if (button) buttons.current.set(key, button);
      else buttons.current.delete(key);
    };

  const change = (next: PosterAnime[], message: string) => {
    setDraft(next);
    setAnnouncement(message);
    save.reset();
  };

  const move = (index: number, by: -1 | 1) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    focusTarget.current = {
      animeId: item.animeId,
      control: by < 0 ? 'up' : 'down'
    };
    change(next, `${item.title} moved to ${index + by + 1}`);
  };

  const remove = (index: number) => {
    const item = items[index];
    const next = items.filter((_, i) => i !== index);
    // The row that takes its place, or the one above it, or the search box
    const neighbour = next[index] ?? next[index - 1];
    focusTarget.current = neighbour
      ? { animeId: neighbour.animeId, control: 'remove' }
      : { to: 'search' };
    change(next, `${item.title} removed`);
  };

  const add = (anime: PosterAnime) => {
    if (full || items.some((item) => item.animeId === anime.animeId)) return;
    const next = [...items, anime];
    const nowFull = next.length >= TOP_ANIME_MAX;
    // The search box is disabled once the list is full, which would drop focus
    if (nowFull) focusTarget.current = { to: 'save' };
    change(
      next,
      `${anime.title} added at ${next.length}.${nowFull ? ' Your top 10 is full.' : ''}`
    );
  };

  // Save and Cancel are disabled once there is nothing to save, which would drop focus
  const restart = () => {
    if (document.activeElement?.closest('[data-top-anime-actions]')) {
      focusTarget.current = { to: 'start' };
    }
  };

  const cancel = () => {
    restart();
    setDraft(null);
    save.reset();
    setAnnouncement('Changes discarded');
  };

  const submit = () => {
    if (save.isPending) return;
    save.mutate(
      items.map((item) => item.animeId),
      {
        onSuccess: () => {
          restart();
          setDraft(null);
          setAnnouncement('Top 10 saved');
        }
      }
    );
  };

  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!saved) return <LoadingSpinner />;

  const emptyMessage = [
    'Pick up to 10 favourites and put them in order.',
    profile?.topAnimePublic === false && 'Only you can see it.'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TopAnimeSearch
        chosenIds={items.map((item) => item.animeId)}
        full={full}
        onAdd={add}
        inputRef={searchInput}
      />
      <TopAnimeList
        items={items}
        emptyMessage={emptyMessage}
        renderAction={(item, index) => (
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between'
            }}>
            <Tooltip title="Move up">
              {/* The span lets the tooltip work while the button is disabled */}
              <span>
                <IconButton
                  size="small"
                  ref={buttonRef(item.animeId, 'up')}
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || save.isPending}
                  aria-label={`Move ${item.title} up`}>
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move down">
              <span>
                <IconButton
                  size="small"
                  ref={buttonRef(item.animeId, 'down')}
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1 || save.isPending}
                  aria-label={`Move ${item.title} down`}>
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Remove">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  ref={buttonRef(item.animeId, 'remove')}
                  onClick={() => remove(index)}
                  disabled={save.isPending}
                  aria-label={`Remove ${item.title} from top 10`}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
      />
      {save.isError && (
        <Alert severity="error">
          Couldn&apos;t save your top 10: {save.error.message}
        </Alert>
      )}
      <Box
        data-top-anime-actions
        sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {/* Stays enabled while saving, so focus doesn't drop */}
        <Button
          variant="contained"
          ref={saveButton}
          onClick={submit}
          disabled={!hasChanges}>
          {save.isPending ? 'Saving...' : 'Save top 10'}
        </Button>
        <Button
          variant="outlined"
          onClick={cancel}
          disabled={!hasChanges || save.isPending}>
          Cancel
        </Button>
      </Box>
      <Box role="status" aria-live="polite" sx={visuallyHidden}>
        {announcement}
      </Box>
    </Box>
  );
};

export default TopAnimeEditor;
