import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Grid, GridBaseProps, SelectChangeEvent, SxProps } from '@mui/material';
import CustomTextField from './TextField';
import CustomSelect from './Select';
import { genresQuery } from '@/helpers/queries';
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
  const { data: genres = [] } = useQuery(genresQuery());

  const separationMargin = { marginTop: '8px' } as SxProps;
  const gridSize = { xs: 12, sm: 6, md: 3 } as GridBaseProps['size'];

  return (
    <form onSubmit={fetchAnimes}>
      <Box role="region" aria-label="Search filters">
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Search filters</legend>
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
        </fieldset>
      </Box>
    </form>
  );
}

export default SearchForm;
