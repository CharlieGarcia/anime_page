import { Genres } from '../types';

const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://kitsu.io/api/edge';

export class KitsuRequestError extends Error {
  status: number;

  constructor(status: number, statusText: string) {
    super(`Kitsu request failed: ${status} ${statusText}`);
    this.name = 'KitsuRequestError';
    this.status = status;
  }
}

export async function kitsuGet<T>(
  endPoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  const response = await fetch(
    `${API_ENDPOINT}${endPoint}${query ? `?${query}` : ''}`,
    {
      headers: {
        Accept: 'application/vnd.api+json'
      }
    }
  );

  if (!response.ok) {
    throw new KitsuRequestError(response.status, response.statusText);
  }

  return response.json();
}

export function formatGenres(genres: Genres[]): string[] | [] {
  return genres.map((genre) => genre.attributes.slug);
}
