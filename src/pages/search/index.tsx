// @ts-nocheck: This file is being ignored temporarily to bypass type errors
import React, { useState, useRef } from 'react';
import _get from 'lodash/get';
import _set from 'lodash/set';
import _reduce from 'lodash/reduce';
import AnimeList from '@/components/animeList';
import CustomPagination from '@/components/pagination';
import LoadingSpinner from '@/components/loadingSpinner';
import SearchForm from '@/components/search/SearchForm';
import { Layout } from '@/components/layout';
import { fetch } from '@/helpers/request';
import {
  ANIME_SEASONS,
  ANIME_STATUS,
  ANIME_SORT,
  ANIME_SUBTYPE,
  ANIME_AGE_RATING,
  ITEMS_PER_PAGE
} from '@/constants';

import {  SearchStateType, SearchOptionsRequestType, SearchFieldsType } from '@/types';
import { Box, SelectChangeEvent } from '@mui/material';

const Search = () => {
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const [pageState, setPageState] = useState({
    searchFields: {
      seasonYear: new Date().getFullYear().toString(),
      sort: ANIME_SORT.popularityRank,
      status: ANIME_STATUS.current,
      season: ANIME_SEASONS.any,
      categories: '',
      subtype: ANIME_SUBTYPE.any,
      ageRating: ANIME_AGE_RATING.any
    },
    searchingStatus: false,
    currentPage: 1,
    animeList: [],
    count: 0
  } as SearchStateType);

  const updateSearchField =
    (fieldName: keyof SearchFieldsType): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | ((event: SelectChangeEvent<string>) => void) =>
    (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
      setPageState((existingState: SearchStateType) => {
        const updatedSearchFieldsState = { ...existingState.searchFields, [fieldName]: evt.target.value };

        return {
          ...existingState,
          searchFields: updatedSearchFieldsState
        };
      });
    };

  const updateAnimeList = (currentPage: number) => {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const searchParams =
      _reduce(
        pageState.searchFields,
        (result, value, key) => {
          if (value) {
            if (key !== 'sort') {
              _set(result, `filter[${key}]`, value);
            } else {
              _set(result, `sort`, value);
            }
          }

          return result;
        },
        {}
      ) || {};
    const options = {
      'page[offset]': offset,
      'page[limit]': ITEMS_PER_PAGE,
      ...searchParams
    } as SearchOptionsRequestType;

    return fetch('/anime', options).then((resp) => {
      setPageState((existingState) => ({
        ...existingState,
        animeList: _get(resp, 'data.data') || [],
        count: _get(resp, 'data.meta.count') || 0,
        currentPage,
        searchingStatus: false
      }));
    });
  };

  const fetchAnimes = (evt: React.FormEvent<HTMLFormElement>) => {
    setPageState((existingState) => ({
      ...existingState,
      searchingStatus: true
    }));
    evt.preventDefault();
    updateAnimeList(pageState.currentPage);
  };

  const clearFilters = () => {
    setPageState((existingState) => ({
      ...existingState,
      searchFields: {
        seasonYear: new Date().getFullYear().toString(),
        sort: ANIME_SORT.popularityRank,
        status: ANIME_STATUS.any,
        season: ANIME_SEASONS.any,
        categories: '',
        subtype: ANIME_SUBTYPE.any,
        ageRating: ANIME_AGE_RATING.any
      },
      currentPage: 1,
      searchingStatus: false,
      count: 0,
      animeList: []
    }));
  };

  const updateCurrentPage = (_evt: React.ChangeEvent<unknown>, page: number) => {
    updateAnimeList(page).then(() => {
      window.scrollTo(0, 0);
      resultsRef.current?.focus();
    });
  };

  return (
    <Layout>
      <h1>Search Animes</h1>
      <SearchForm
        searchFields={pageState.searchFields}
        updateSearchField={updateSearchField}
        fetchAnimes={fetchAnimes}
        clearFilters={clearFilters}
      />
      <Box role="region" aria-live="polite" aria-label="Search results" aria-atomic="true">
        <h2 id="results-heading" ref={resultsRef} tabIndex={-1}>
          {pageState.animeList.length ? `Search Results (${pageState.count})` : 'Search Results'}
        </h2>
        {pageState.searchingStatus === true ? (
          <LoadingSpinner />
        ) : (
          <AnimeList list={pageState.animeList} />
        )}
        {pageState.count ? (
          <CustomPagination
            total={pageState.count}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={pageState.currentPage}
            updateCurrentPage={updateCurrentPage}
          />
        ) : null}
      </Box>
    </Layout>
  );
};

export default Search;
