import { useEffect, useState } from 'react';
import _get from 'lodash/get';

import { fetch } from '../helpers/request';

function useFetch(endpoint, options) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnimeList = async () => {
      const response = await fetch(endpoint, options);
      let _result = _get(response, 'data.data', []);

      if (typeof options?.onSuccess === 'function') {
        _result = await options.onSuccess(_result);
      }

      setData(_result);
      setIsLoading(false);
    };

    fetchAnimeList().catch((e) => {
      console.error(e);

      setData([]);
      setError(e);
      setIsLoading(false);
    });
  }, [endpoint, options?.onSuccess]);

  return { data, error, isLoading };
}

export default useFetch;
