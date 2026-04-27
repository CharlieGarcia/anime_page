import React, { useState, useEffect } from 'react';
import { Button, Grid, GridBaseProps, SelectChangeEvent, SxProps } from '@mui/material';
import CustomTextField from './TextField';
import CustomSelect from './Select';
import { fetch, formatGenres } from '@/helpers/request';
import {
  ANIME_SEASONS,
  ANIME_STATUS,
  ANIME_SORT,
  ANIME_SUBTYPE,
  ANIME_AGE_RATING
} from '@/constants';
import { SearchFieldsType } from '@/types';

type SearchFormProps = {
  searchFields: SearchFieldsType;
  clearFilters: () => void;
  fetchAnimes: (event: React.FormEvent<HTMLFormElement>) => void;
  updateSearchField: (name: keyof SearchFieldsType) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => void;
};

function SearchForm({
  searchFields,
  clearFilters,
  fetchAnimes,
  updateSearchField
}: SearchFormProps) {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const resp = await fetch('/genres');
      const genres = formatGenres(resp.data.data);

      setGenres(genres);
    };

    fetchGenres();
  }, []);

  const separationMargin = { marginTop: '8px' } as SxProps;
  const gridSize = { xs: 12, sm: 6, md: 3 } as GridBaseProps['size'];

  return (
    <form onSubmit={fetchAnimes}>
      <Grid container spacing={2}>
        <Grid size={gridSize} sx={separationMargin}>
          <CustomTextField
            label="Anime Year"
            id="year"
            name="seasonYear"
            value={searchFields.seasonYear}
            onChange={updateSearchField('seasonYear')}
            fullWidth
          />
        </Grid>
        <Grid size={gridSize} sx={separationMargin}>
          <CustomSelect
            value={searchFields.season}
            list={Object.values(ANIME_SEASONS)}
            handleChange={updateSearchField('season')}
            name="season"
            fullWidth
          />
        </Grid>
        <Grid size={gridSize} sx={separationMargin}>
          <CustomSelect
            value={searchFields.status}
            list={Object.values(ANIME_STATUS)}
            handleChange={updateSearchField('status')}
            name="status"
            fullWidth
          />
        </Grid>
        <Grid size={gridSize} sx={separationMargin}>
          <CustomSelect
            value={searchFields.categories}
            list={genres}
            handleChange={updateSearchField('categories')}
            name="categories"
            fullWidth
          />
        </Grid>
        <Grid size={gridSize} sx={separationMargin}>
          <CustomSelect
            value={searchFields.sort}
            list={Object.values(ANIME_SORT)}
            handleChange={updateSearchField('sort')}
            name="sort"
            fullWidth
          />
        </Grid>
        <Grid size={gridSize} sx={separationMargin}>
          <CustomSelect
            value={searchFields.subtype}
            list={Object.values(ANIME_SUBTYPE)}
            handleChange={updateSearchField('subtype')}
            name="subtype"
            fullWidth
          />
        </Grid>
        <Grid size={gridSize} sx={separationMargin}>
          <CustomSelect
            value={searchFields.ageRating}
            list={Object.values(ANIME_AGE_RATING)}
            handleChange={updateSearchField('ageRating')}
            name="ageRating"
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid size={gridSize} sx={separationMargin}>
        <Button variant="contained" type="submit">
          Search
        </Button>
        <Button variant="outlined" onClick={clearFilters}>
          Clear filters
        </Button>
      </Grid>
    </form>
  );
}

export default SearchForm;
