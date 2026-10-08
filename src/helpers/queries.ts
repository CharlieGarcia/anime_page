import {
  infiniteQueryOptions,
  queryOptions,
  skipToken
} from '@tanstack/react-query';
import _kebabCase from 'lodash/kebabCase';
import { kitsuGet, formatGenres } from './request';
import { ITEMS_PER_PAGE } from '@/constants';
import { Anime, Category, Episode, Genres, SearchFieldsType } from '@/types';

export const TRENDING_LIMIT = 12;
export const EPISODES_PER_PAGE = 13;
export const RELATED_PER_PAGE = 13;

type JsonApiResponse<T> = {
  data: T;
  meta?: { count?: number };
};

export type CategoryTag = {
  slug: string;
  id: string;
  title: string;
};

export type EpisodeItem = {
  id: string;
  title: string;
  number: string;
  thumbnailUrl: string;
  synopsis: string;
};

export type SearchRequest = {
  fields: SearchFieldsType;
  page: number;
};

function nextOffset<T>(
  pages: { items: T[]; total: number }[],
  perPage: number
) {
  const loaded = pages.length * perPage;
  return loaded < pages[0].total ? loaded : undefined;
}

export const trendingAnimeQuery = () =>
  queryOptions({
    queryKey: ['anime', 'trending', TRENDING_LIMIT],
    queryFn: async () => {
      const response = await kitsuGet<JsonApiResponse<Anime[]>>(
        '/trending/anime',
        {
          limit: TRENDING_LIMIT
        }
      );
      return response.data;
    }
  });

export const animeDetailsQuery = (id: string) =>
  queryOptions({
    queryKey: ['anime', id],
    queryFn: async () => {
      const response = await kitsuGet<JsonApiResponse<Anime>>(`/anime/${id}`);
      return response.data;
    }
  });

export const animeCategoriesQuery = (id: string) =>
  queryOptions({
    queryKey: ['anime', id, 'categories'],
    queryFn: async (): Promise<CategoryTag[]> => {
      const response = await kitsuGet<JsonApiResponse<Category[]>>(
        `/anime/${id}/categories`
      );
      return response.data.map((category) => ({
        slug: `/related/${_kebabCase(category.attributes.title)}`,
        id: category.id,
        title: category.attributes.title
      }));
    }
  });

export const animeEpisodesQuery = (id: string) =>
  infiniteQueryOptions({
    queryKey: ['anime', id, 'episodes'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await kitsuGet<JsonApiResponse<Episode[]>>(
        `/anime/${id}/episodes`,
        {
          'page[limit]': EPISODES_PER_PAGE,
          'page[offset]': pageParam
        }
      );
      return {
        items: response.data.map((episode): EpisodeItem => ({
          id: episode.id,
          title: episode.attributes.canonicalTitle || 'Not Aired Yet',
          number: String(episode.attributes.number ?? ''),
          thumbnailUrl: episode.attributes.thumbnail?.original || '',
          synopsis: episode.attributes.synopsis || ''
        })),
        total: response.meta?.count ?? 0
      };
    },
    getNextPageParam: (_lastPage, pages) => nextOffset(pages, EPISODES_PER_PAGE)
  });

export const relatedAnimeQuery = (slug: string) =>
  infiniteQueryOptions({
    queryKey: ['anime', 'related', slug],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = await kitsuGet<JsonApiResponse<Anime[]>>('/anime', {
        'filter[categories]': slug,
        'page[limit]': RELATED_PER_PAGE,
        'page[offset]': pageParam
      });
      return {
        items: response.data,
        total: response.meta?.count ?? 0
      };
    },
    getNextPageParam: (_lastPage, pages) => nextOffset(pages, RELATED_PER_PAGE)
  });

function buildSearchParams(fields: SearchFieldsType, page: number) {
  const params: Record<string, string | number> = {
    'page[offset]': (page - 1) * ITEMS_PER_PAGE,
    'page[limit]': ITEMS_PER_PAGE
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (!value) return;
    params[key === 'sort' ? 'sort' : `filter[${key}]`] = value;
  });

  return params;
}

export const searchAnimeQuery = (search: SearchRequest | null) =>
  queryOptions({
    queryKey: ['anime', 'search', search],
    queryFn: search
      ? async () => {
          const response = await kitsuGet<JsonApiResponse<Anime[]>>(
            '/anime',
            buildSearchParams(search.fields, search.page)
          );
          return {
            animeList: response.data,
            count: response.meta?.count ?? 0
          };
        }
      : skipToken
  });

export const genresQuery = () =>
  queryOptions({
    queryKey: ['genres'],
    queryFn: async () => {
      const response = await kitsuGet<JsonApiResponse<Genres[]>>('/genres');
      return formatGenres(response.data);
    }
  });
