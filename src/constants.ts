export const ANIME_SEASONS = {
  any: '',
  winter: 'winter',
  spring: 'spring',
  summer: 'summer',
  fall: 'fall'
};

export const ANIME_STATUS = {
  any: '',
  current: 'current',
  finished: 'finished',
  tba: 'tba',
  unreleased: 'unreleased',
  upcoming: 'upcoming'
};

export const ANIME_SORT = {
  id: 'id',
  score: 'score',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  popularityRank: 'popularityRank',
  ratingRank: 'ratingRank',
  averageRating: 'averageRating',
  startDate: 'startDate',
  endDate: 'endDate'
};

export const ANIME_SUBTYPE = {
  any: '',
  ona: 'ONA',
  ova: 'OVA',
  tv: 'TV',
  movie: 'movie',
  music: 'music',
  special: 'special'
};

export const ANIME_AGE_RATING = {
  any: '',
  g: 'G',
  pg: 'PG',
  r: 'R'
};

export const ITEMS_PER_PAGE = 12;

// localStorage key holding the user's light/dark preference
export const MODE_STORAGE_KEY = 'theme';

// How long a statically generated page is served before it is regenerated in the background
export const REVALIDATE_SECONDS = 60 * 60;
// Shorter window used when Kitsu failed during generation, so the page is retried soon
export const REVALIDATE_AFTER_ERROR_SECONDS = 60;
