import React, { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import type { PosterAnime } from '@/components/posterCard/PosterCard';
import { animeTitleSearchQuery } from '@/helpers/queries';

// How long typing has to pause before Kitsu is asked
export const SEARCH_DEBOUNCE_MS = 300;

type TopAnimeSearchProps = {
  // Already in the list, so shown but not selectable
  chosenIds: string[];
  // The list has no room left: the box is disabled and says so
  full: boolean;
  onAdd: (anime: PosterAnime) => void;
  inputRef?: React.Ref<HTMLInputElement>;
};

// "Add anime" search-as-you-type box over Kitsu titles
const TopAnimeSearch = ({
  chosenIds,
  full,
  onAdd,
  inputRef
}: TopAnimeSearchProps) => {
  const [text, setText] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const timer = setTimeout(
      () => setSearchText(text.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [text]);

  const { data, isFetching, error } = useQuery({
    ...animeTitleSearchQuery(searchText),
    // Keep the last matches on screen while the next ones load
    placeholderData: keepPreviousData
  });
  const options = text.trim() && searchText ? (data ?? []) : [];
  const waiting =
    Boolean(text.trim()) && (text.trim() !== searchText || isFetching);

  return (
    <Autocomplete<PosterAnime>
      options={options}
      // Kitsu already matched the text
      filterOptions={(matches) => matches}
      getOptionLabel={(anime) => anime.title}
      isOptionEqualToValue={(option, value) => option.animeId === value.animeId}
      getOptionDisabled={(anime) => chosenIds.includes(anime.animeId)}
      // The box only picks; the list holds the choices
      value={null}
      onChange={(_event, anime) => {
        if (anime) onAdd(anime);
      }}
      inputValue={text}
      // Empty again once an anime is picked, ready for the next
      onInputChange={(_event, value, reason) =>
        setText(reason === 'input' ? value : '')
      }
      disabled={full}
      loading={waiting}
      loadingText="Searching..."
      noOptionsText={
        error
          ? `Couldn't search: ${error.message}`
          : text.trim()
            ? 'No anime found'
            : 'Type a title to search'
      }
      autoHighlight
      renderOption={({ key, ...props }, anime) => (
        <Box component="li" key={key} {...props}>
          <Box>
            <Typography>{anime.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {[
                anime.subtype,
                chosenIds.includes(anime.animeId) && 'Already in your top 10'
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Add anime"
          inputRef={inputRef}
          helperText={full ? 'Your top 10 is full' : undefined}
        />
      )}
    />
  );
};

export default TopAnimeSearch;
