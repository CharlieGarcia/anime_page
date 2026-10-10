import _map from 'lodash/map';
import { Genres } from '../types';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

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
    throw new Error(
      `Kitsu request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export function formatGenres(genres: Genres[]): string[] | [] {
  return _map(genres, 'attributes.slug') || [];
}
