import axios from 'axios';
import _map from 'lodash/map';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export function fetch(endPoint, params) {
  return axios.get(`${API_ENDPOINT}${endPoint}`, { params });
}

export function formatGenres(genres) {
  return _map(genres, 'attributes.slug') || [];
}
