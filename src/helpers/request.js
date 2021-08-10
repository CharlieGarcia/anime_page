import axios from 'axios';

const { API_ENDPOINT } = process.env; // Token expires after an hour which it's need it in milliseconds

function requestAnimeList(endPoint, params) {
  return axios.get(`${API_ENDPOINT}${endPoint}`, { params });
}

export default requestAnimeList;
