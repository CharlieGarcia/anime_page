import { animeSnapshot, type AnimeSnapshot } from '@/helpers/animeSnapshot';
import { KitsuRequestError, kitsuGet } from '@/helpers/request';
import type { Anime } from '@/types';

// Long enough for a slow Kitsu response, short enough that a hung one fails the request
const KITSU_TIMEOUT_MS = 5000;

// The title, poster and subtype of one anime, read from Kitsu.
// Returns null when Kitsu has no anime with that id; throws when Kitsu can't be reached.
export async function loadAnimeSnapshot(
  animeId: string
): Promise<AnimeSnapshot | null> {
  try {
    const { data } = await kitsuGet<{ data: Anime }>(
      `/anime/${animeId}`,
      {},
      { signal: AbortSignal.timeout(KITSU_TIMEOUT_MS) }
    );
    return animeSnapshot(data.attributes);
  } catch (error) {
    if (error instanceof KitsuRequestError && error.status === 404) return null;
    throw error;
  }
}
