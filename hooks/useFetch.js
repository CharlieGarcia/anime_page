import { useEffect, useState } from 'react';
import _get from 'lodash/get';

import { fetch } from '../helpers/request';

function useFetch(endpoint, options) {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnimeList = async () => {
      setIsLoading(true);
      const response = await fetch(endpoint, options);

      setData(_get(response, 'data.data', []));
      setCount(_get(response, 'data.meta.count') || 0);
      setIsLoading(false);
    };

    fetchAnimeList().catch((e) => {
      console.error(e);

      setData([]);
      setCount(0);
      setError(e.message);
      setIsLoading(false);
    });
  }, []);

  return { data, error, count, isLoading };
}

export default useFetch;
