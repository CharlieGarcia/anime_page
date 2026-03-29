import { useEffect, useState } from 'react';
import _get from 'lodash/get';

import { fetch } from '../helpers/request';

function useFetch(endpoint: string, options = {}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const optionsStringify = JSON.stringify(options);
  
  useEffect(() => {
    const fetchAnimeList = async () => {
      const optionsParsed = JSON.parse(optionsStringify)
      const response = await fetch(endpoint, optionsParsed);
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
  }, [endpoint, optionsStringify]);

  return { data, error, isLoading };
}

export default useFetch;
