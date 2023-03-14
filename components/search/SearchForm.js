import React, { useState, useEffect } from 'react';
import Select from './Select';
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
      <label htmlFor="year">
        Anime Year
        <input
          id="year"
          name="seasonYear"
          type="text"
          value={searchFields.seasonYear}
          onChange={updateSearchField('seasonYear')}
        />
      </label>
      <Select
        value={searchFields.season}
        list={Object.values(ANIME_SEASONS)}
        handleChange={updateSearchField('season')}
        name="season"
      />
      <Select
        value={searchFields.status}
        list={Object.values(ANIME_STATUS)}
        handleChange={updateSearchField('status')}
        name="status"
      />
      <Select
        value={searchFields.categories}
        list={genres}
        handleChange={updateSearchField('categories')}
        name="categories"
      />
      <Select
        value={searchFields.sort}
        list={Object.values(ANIME_SORT)}
        handleChange={updateSearchField('sort')}
        name="sort"
      />
      <Select
        value={searchFields.subtype}
        list={Object.values(ANIME_SUBTYPE)}
        handleChange={updateSearchField('subtype')}
        name="subtype"
      />
      <Select
        value={searchFields.ageRating}
        list={Object.values(ANIME_AGE_RATING)}
        handleChange={updateSearchField('ageRating')}
        name="ageRating"
      />
      <button type="submit">Search</button>
      <button onClick={clearFilters}>Clear filters</button>
    </form>
  );
}

export default SearchForm;
