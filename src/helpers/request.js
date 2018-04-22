import axios from 'axios';
import queryString from 'query-string';

const { REACT_APP_API_URL, REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET } = process.env,
  TOKEN_EXPIRATION = 3600 * 1000; // Token expires after an hour which it's need it in milliseconds

let LAST_REQUESTED_TOKEN = 0,
  ACCESS_TOKEN = '';

function removeAdultAnimes(animeList) {
  return animeList.filter(anime => anime.adult !== true);
}

function getAuthenticationToken(endPoint, params) {
  const query = queryString.stringify(params)

  return axios.post(`${REACT_APP_API_URL}${endPoint}?${query}`)
    .then(({ data }) => {
      const { access_token } = data;

      ACCESS_TOKEN = access_token;
      LAST_REQUESTED_TOKEN = Date.now();

      return access_token;
    })
    .catch(error => console.log(error));
}

function shouldReuestToken() {
  return Date.now() >= (LAST_REQUESTED_TOKEN + TOKEN_EXPIRATION);
}

function requestAnimeList(endPoint, params) {
  return function (token) {
    params = Object.assign(params, { access_token: token });

    return axios.get(`${REACT_APP_API_URL}${endPoint}`, { params })
      .then(({data}) => removeAdultAnimes(data));
  };
}

function hanldeAnimeRequest(endPoint, params) {
  const requestAnimes = requestAnimeList(endPoint, params);

  if (shouldReuestToken()) {
    return getAuthenticationToken('/auth/access_token',
      {
        grant_type: 'client_credentials',
        client_id: REACT_APP_CLIENT_ID,
        client_secret: REACT_APP_CLIENT_SECRET
      }).then(requestAnimes);
  }

  return requestAnimes(ACCESS_TOKEN)
}

export default hanldeAnimeRequest;
