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

export type Anime = {
  id: string;
  type: string;
  links: AnimeLinks;
  attributes: Attributes;
  relationships: { [key: string]: Relationship };
}

type Attributes = {
  createdAt: string;
  updatedAt: string;
  slug: string;
  synopsis: string | null;
  description: string | null;
  coverImageTopOffset: number;
  titles: Titles;
  canonicalTitle: string;
  abbreviatedTitles: string[];
  averageRating: string | null;
  ratingFrequencies: { [key: string]: string };
  userCount: number;
  favoritesCount: number;
  startDate: string | null;
  endDate: string | null;
  nextRelease: string | null;
  popularityRank: number;
  ratingRank: number | null;
  ageRating: string | null;
  ageRatingGuide: string | null;
  subtype: string;
  status: string;
  tba: string | null;
  posterImage: PosterImage | null;
  coverImage: CoverImage | null;
  episodeCount: number | null;
  episodeLength: number | null;
  totalLength: number | null;
  youtubeVideoId: string | null;
  showType: string;
  nsfw: boolean;
}

type CoverImage = {
  tiny?: string;
  large?: string;
  small?: string;
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
  width: number | null;
  height: number | null;
}

type PosterImage = {
  tiny?: string;
  large?: string;
  small?: string;
  medium?: string;
  original: string;
  meta: Meta;
}

// Keyed by locale (en, en_jp, ja_jp, ...); which locales are present varies per title.
type Titles = {
  [locale: string]: string | null | undefined;
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

export type Category = {
  id: string;
  type: string;
  attributes: {
    title: string;
    slug: string;
  };
}

export type Episode = {
  id: string;
  type: string;
  attributes: {
    canonicalTitle: string | null;
    number: number | null;
    synopsis: string | null;
    thumbnail: { original?: string } | null;
  };
}
