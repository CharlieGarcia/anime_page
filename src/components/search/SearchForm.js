import React, { useState, useEffect } from 'react';
import Select from './Select';
import { fetch, formatGenres } from '../../helpers/request';
import {
  ANIME_SEASONS,
  ANIME_STATUS,
  ANIME_SORT,
  ANIME_SUBTYPE,
  ANIME_AGE_RATING
} from '../../constants'

function SearchForm({ searchFields, clearFilters, fetchAnimes, updateSelectField, updateTextField }) {

  const [genres, setGenres] = useState([]);

  useEffect(async () => {
    let genres = await fetch('/genres');
    genres = formatGenres(genres.data.data);

    setGenres(genres);
  });

  return (
    <form onSubmit={fetchAnimes}>
      <label htmlFor="year">
        Anime Year
        <input id="year" name="seasonYear" type="text" value={searchFields.seasonYear} onChange={updateTextField} />
      </label>
      <Select value={searchFields.season} list={Object.values(ANIME_SEASONS)} handleChange={updateSelectField} name="season" />
      <Select value={searchFields.status} list={Object.values(ANIME_STATUS)} handleChange={updateSelectField} name="status" />
      <Select value={searchFields.categories} list={genres} handleChange={updateSelectField} name="categories" />
      <Select value={searchFields.sort} list={Object.values(ANIME_SORT)} handleChange={updateSelectField} name="sort" />
      <Select value={searchFields.subtype} list={Object.values(ANIME_SUBTYPE)} handleChange={updateSelectField} name="subtype" />
      <Select value={searchFields.ageRating} list={Object.values(ANIME_AGE_RATING)} handleChange={updateSelectField} name="ageRating" />
      <button type="submit">Search</button>
      <button onClick={clearFilters}>Clear filters</button>
    </form>
  );
}

export default SearchForm;
