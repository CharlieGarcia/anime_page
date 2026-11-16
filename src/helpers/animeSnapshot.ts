import type { Anime } from '@/types';

// What a watch list item keeps of an anime, so lists render without calling Kitsu
export type AnimeSnapshot = {
  title: string;
  posterUrl: string | null;
  subtype: string | null;
};

// Used by the server when it stores an item and by the browser when it shows one
// before the server answers, so both agree
export function animeSnapshot({
  canonicalTitle,
  posterImage,
  subtype
}: Pick<
  Anime['attributes'],
  'canonicalTitle' | 'posterImage' | 'subtype'
>): AnimeSnapshot {
  return {
    title: canonicalTitle,
    // The same size the anime cards show
    posterUrl:
      posterImage?.large || posterImage?.small || posterImage?.original || null,
    subtype: subtype || null
  };
}
