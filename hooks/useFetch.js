import React, { useEffect, useState } from 'react';
import _get from 'lodash/get';

import { fetch } from '../helpers/request';

function useFetch(endpoint, options) {
  const [result, setResult] = useState({ data: [], count: 0, error: null });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnimeList = async () => {
      setIsLoading(true);
      const response = await fetch(endpoint, options);

      setResult({
        data: _get(response, 'data.data', []),
        count: _get(response, 'data.meta.count') || 0,
        error: null
      });
      setIsLoading(false);
    };

    fetchAnimeList().catch((e) => {
      console.error(e);

      setResult({ data: [], count: 0, error: e });
      setIsLoading(false);
    });
  }, []);

  return { ...result, isLoading };
}

export default useFetch;
