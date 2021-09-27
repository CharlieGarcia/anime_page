import axios from 'axios';
import _map from 'lodash/map';

const { API_ENDPOINT } = process.env; // Token expires after an hour which it's need it in milliseconds

export function fetch(endPoint, params) {
  return axios.get(`${API_ENDPOINT}${endPoint}`, { params });
};

export function formatGenres(genres) {
  return _map(genres, 'attributes.slug') || [];
};
