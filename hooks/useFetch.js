import { useEffect, useState } from 'react';
import _get from 'lodash/get';

import { fetch } from '../helpers/request';

function useFetch(endpoint, options = {}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnimeList = async () => {
      const response = await fetch(endpoint, options);
      const _result = _get(response, 'data.data', []);

      setData(_result);
      setIsLoading(false);
    };

    fetchAnimeList().catch((e) => {
      console.error(e);

      setData([]);
      setError(e);
      setIsLoading(false);
    });
  }, [endpoint]);

  return { data, error, isLoading };
}

export default useFetch;
