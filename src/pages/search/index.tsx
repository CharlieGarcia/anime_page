import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, SelectChangeEvent } from '@mui/material';
import AnimeList from '@/components/animeList';
import CustomPagination from '@/components/pagination';
import LoadingSpinner from '@/components/loadingSpinner';
import SearchForm from '@/components/search/SearchForm';
import { Layout } from '@/components/layout';
import { SearchRequest, searchAnimeQuery } from '@/helpers/queries';
import {
  ANIME_SEASONS,
  ANIME_STATUS,
  ANIME_SORT,
  ANIME_SUBTYPE,
  ANIME_AGE_RATING,
  ITEMS_PER_PAGE
} from '@/constants';
import { SearchFieldsType } from '@/types';

const defaultSearchFields = (status: string): SearchFieldsType => ({
  seasonYear: new Date().getFullYear().toString(),
  sort: ANIME_SORT.popularityRank,
  status,
  season: ANIME_SEASONS.any,
  categories: '',
  subtype: ANIME_SUBTYPE.any,
  ageRating: ANIME_AGE_RATING.any
});

const Search = () => {
  const queryClient = useQueryClient();
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const [searchFields, setSearchFields] = useState<SearchFieldsType>(() =>
    defaultSearchFields(ANIME_STATUS.current)
  );
  // The search that was last submitted; null until the form is submitted
  const [search, setSearch] = useState<SearchRequest | null>(null);
  const { data, error, isFetching } = useQuery(searchAnimeQuery(search));
  const animeList = data?.animeList ?? [];
  const count = data?.count ?? 0;

  const updateSearchField =
    (fieldName: keyof SearchFieldsType) =>
    (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
      setSearchFields((existingFields) => ({
        ...existingFields,
        [fieldName]: evt.target.value
      }));
    };

  const fetchAnimes = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setSearch({ fields: searchFields, page: 1 });
  };

  const clearFilters = () => {
    setSearchFields(defaultSearchFields(ANIME_STATUS.any));
    setSearch(null);
  };

  const updateCurrentPage = async (_evt: React.ChangeEvent<unknown>, page: number) => {
    if (!search) return;

    const nextSearch = { ...search, page };
    // Load the page before switching to it so the current results stay visible meanwhile
    await queryClient.fetchQuery(searchAnimeQuery(nextSearch));
    setSearch(nextSearch);
    window.scrollTo(0, 0);
    resultsRef.current?.focus();
  };

  return (
    <Layout>
      <h1>Search Animes</h1>
      <SearchForm
        searchFields={searchFields}
        updateSearchField={updateSearchField}
        fetchAnimes={fetchAnimes}
        clearFilters={clearFilters}
      />
      <Box role="region" aria-live="polite" aria-label="Search results" aria-atomic="true">
        <h2 id="results-heading" ref={resultsRef} tabIndex={-1}>
          {animeList.length ? `Search Results (${count})` : 'Search Results'}
        </h2>
        {error ? error.message : null}
        {isFetching ? <LoadingSpinner /> : <AnimeList list={animeList} />}
        {count ? (
          <CustomPagination
            total={count}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={search?.page}
            updateCurrentPage={updateCurrentPage}
          />
        ) : null}
      </Box>
    </Layout>
  );
};

export default Search;
