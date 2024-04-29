import React, { useCallback, useState } from 'react';
import _get from 'lodash/get';
import _reduce from 'lodash/reduce';
import AnimeList from '../../components/animeList';
import CustomPagination from '../../components/pagination';
import SearchForm from '../../components/search/searchForm';
import { Layout } from '../../components/layout';
import { fetch } from '../../helpers/request';
import {
  ANIME_SEASONS,
  ANIME_STATUS,
  ANIME_SORT,
  ANIME_SUBTYPE,
  ANIME_AGE_RATING,
  ITEMS_PER_PAGE
} from '../../constants';

const Search = () => {
  const [pageState, setPageState] = useState({
    searchFields: {
      seasonYear: new Date().getFullYear(),
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
  });

  const updateSearchField = (fieldName) => (evt) => {
    setPageState((existingState) => {
      const updatedSearchFieldsState = existingState.searchFields;
      updatedSearchFieldsState[fieldName] = evt.target.value;

      return {
        ...existingState,
        searchFields: updatedSearchFieldsState
      };
    });
  };

  const updateAnimeList = (currentPage) => {
    const offset = currentPage > 1 ? currentPage * ITEMS_PER_PAGE : currentPage;
    const searchParams =
      _reduce(
        pageState.searchFields,
        (result, value, key) => {
          if (value) {
            if (key !== 'sort') {
              result[`filter[${key}]`] = value;
            } else {
              result[`sort`] = value;
            }
          }

          return result;
        },
        {}
      ) || {};
    const options = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      'page[offset]': offset,
      'page[limit]': ITEMS_PER_PAGE,
      ...searchParams
    };

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

  const fetchAnimes = (evt) => {
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
        seasonYear: new Date().getFullYear(),
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

  const updateCurrentPage = useCallback(
    (evt) => {
      updateAnimeList(parseInt(evt.target.outerText)).then(() => {
        window.scrollTo(0, 0);
      });
    },
    [pageState.searchFields]
  );

  return (
    <Layout>
      <SearchForm
        searchFields={pageState.searchFields}
        updateSearchField={updateSearchField}
        fetchAnimes={fetchAnimes}
        clearFilters={clearFilters}
      />
      {pageState.searchingStatus === true ? (
        'Loading...'
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
    </Layout>
  );
};

export default Search;
