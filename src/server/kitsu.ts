import { animeSnapshot, type AnimeSnapshot } from '@/helpers/animeSnapshot';
import { kitsuGet } from '@/helpers/request';
import type { Anime } from '@/types';

// Long enough for a slow Kitsu response, short enough that a hung one fails the request
const KITSU_TIMEOUT_MS = 5000;

// The most ids one lookup takes: a full top 10
export const KITSU_BATCH_MAX = 10;

type SnapshotFields = Pick<
  Anime['attributes'],
  'canonicalTitle' | 'posterImage' | 'subtype'
>;

// The title, poster and subtype of several anime, read from Kitsu in one request
// and keyed by anime id. Ids Kitsu doesn't know are missing from the map.
// Throws when Kitsu can't be reached.
export async function loadAnimeSnapshots(
  animeIds: string[]
): Promise<Map<string, AnimeSnapshot>> {
  const snapshots = new Map<string, AnimeSnapshot>();
  if (animeIds.length === 0) return snapshots;
  if (animeIds.length > KITSU_BATCH_MAX) {
    throw new Error(`Look up at most ${KITSU_BATCH_MAX} anime at a time`);
  }

  const { data } = await kitsuGet<{
    data: { id: string; attributes: SnapshotFields }[];
  }>(
    '/anime',
    {
      'filter[id]': animeIds.join(','),
      'page[limit]': KITSU_BATCH_MAX,
      'fields[anime]': 'canonicalTitle,posterImage,subtype'
    },
    { signal: AbortSignal.timeout(KITSU_TIMEOUT_MS) }
  );
  // Kitsu sorts the results by id, not in the order asked for, so match them by id
  for (const anime of data) {
    snapshots.set(anime.id, animeSnapshot(anime.attributes));
  }
  return snapshots;
}

// The title, poster and subtype of one anime, read from Kitsu.
// Returns null when Kitsu has no anime with that id; throws when Kitsu can't be reached.
export async function loadAnimeSnapshot(
  animeId: string
): Promise<AnimeSnapshot | null> {
  return (await loadAnimeSnapshots([animeId])).get(animeId) ?? null;
}
