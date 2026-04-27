export type Genres = {
  id: string;
  type: string;
  links: GenresLink;
  attributes: GenresAttributes;
}

type GenresAttributes = {
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: null | string;
}

type GenresLink = {
  self: string;
}

export type SearchFieldsType = {
  seasonYear: string;
  sort: string;
  status: string;
  season: string;
  categories: string;
  subtype: string;
  ageRating: string;
};

export type SearchStateType = {
  searchFields: SearchFieldsType;
  searchingStatus: boolean;
  currentPage: number;
  animeList: Anime[];
  count: number;
};

export type SearchOptionsRequestType = {
  'page[offset]': number;
  'page[limit]': number;
  [key: string]: string | number;
};

export type Anime = {
  id: string;
  type: string;
  links: AnimeLinks;
  attributes: Attributes;
  relationships: { [key: string]: Relationship };
}

type Attributes = {
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  synopsis: string;
  description: string;
  coverImageTopOffset: number;
  titles: Titles;
  canonicalTitle: string;
  abbreviatedTitles: string[];
  averageRating: string;
  ratingFrequencies: { [key: string]: string };
  userCount: number;
  favoritesCount: number;
  startDate: Date;
  endDate: Date;
  nextRelease: null;
  popularityRank: number;
  ratingRank: number;
  ageRating: string;
  ageRatingGuide: string;
  subtype: string;
  status: string;
  tba: null;
  posterImage: PosterImage;
  coverImage: CoverImage;
  episodeCount: number;
  episodeLength: number;
  totalLength: number;
  youtubeVideoId: string;
  showType: string;
  nsfw: boolean;
}

type CoverImage = {
  tiny: string;
  large: string;
  small: string;
  original: string;
  meta: Meta;
}

type Meta = {
  dimensions: Dimensions;
}

type Dimensions = {
  tiny: Large;
  large: Large;
  small: Large;
  medium?: Large;
}

type Large = {
  width: number;
  height: number;
}

type PosterImage = {
  tiny: string;
  large: string;
  small: string;
  medium: string;
  original: string;
  meta: Meta;
}

type Titles = {
  en: string;
  en_jp: string;
  en_us: string;
  ja_jp: string;
}

type AnimeLinks = {
  self: string;
}

type Relationship = {
  links: RelationshipLinks;
}

type RelationshipLinks = {
  self: string;
  related: string;
}
