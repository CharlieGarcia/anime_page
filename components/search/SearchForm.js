import React, { useState, useEffect } from 'react';
import { Button, Grid } from '@mui/material';
import CustomTextField from './TextField';
import CustomSelect from './Select';
import { fetch, formatGenres } from '../../helpers/request';
import {
  ANIME_SEASONS,
  ANIME_STATUS,
  ANIME_SORT,
  ANIME_SUBTYPE,
  ANIME_AGE_RATING
} from '../../constants';

function SearchForm({
  searchFields,
  clearFilters,
  fetchAnimes,
  updateSearchField
}) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const resp = await fetch('/genres');
      const genres = formatGenres(resp.data.data);

      setGenres(genres);
    };

    fetchGenres();
  }, []);

  return (
    <form onSubmit={fetchAnimes}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6} md={3} item>
          <CustomTextField
            label="Anime Year"
            id="year"
            name="seasonYear"
            value={searchFields.seasonYear}
            onChange={updateSearchField('seasonYear')}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3} item>
          <CustomSelect
            value={searchFields.season}
            list={Object.values(ANIME_SEASONS)}
            handleChange={updateSearchField('season')}
            name="season"
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={6} md={3} item>
          <CustomSelect
            value={searchFields.status}
            list={Object.values(ANIME_STATUS)}
            handleChange={updateSearchField('status')}
            name="status"
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={6} md={3} item>
          <CustomSelect
            value={searchFields.categories}
            list={genres}
            handleChange={updateSearchField('categories')}
            name="categories"
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={6} md={3} item>
          <CustomSelect
            value={searchFields.sort}
            list={Object.values(ANIME_SORT)}
            handleChange={updateSearchField('sort')}
            name="sort"
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={6} md={3} item>
          <CustomSelect
            value={searchFields.subtype}
            list={Object.values(ANIME_SUBTYPE)}
            handleChange={updateSearchField('subtype')}
            name="subtype"
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={6} md={3} item>
          <CustomSelect
            value={searchFields.ageRating}
            list={Object.values(ANIME_AGE_RATING)}
            handleChange={updateSearchField('ageRating')}
            name="ageRating"
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid xs={12} sm={6} md={3} item>
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
