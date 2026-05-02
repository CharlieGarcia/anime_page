import axios from 'axios';
import _map from 'lodash/map';
import { Genres } from '../types';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export function fetch(endPoint: string, params: Record<string, string | number> = {}) {
  return axios.get(`${API_ENDPOINT}${endPoint}`, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }, ...params });
}

export function formatGenres(genres: Genres[]): string[] | [] {
  return _map(genres, 'attributes.slug') || [];
}
