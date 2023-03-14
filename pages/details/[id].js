import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import _get from 'lodash/get';
import { fetch } from '../../helpers/request';

function Detail() {
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState({
    info: {},
    infoStatus: false
  });

  useEffect(() => {
    setState((existingState) => ({
      ...existingState,
      infoStatus: true
    }));

    const fetchInfo = async () => {
      if (!router.isReady) return;
      const _info = await fetch(`/anime/${id}`);

      setState((existingState) => ({
        ...existingState,
        info: _get(_info, 'data.data') || {},
        infoStatus: false
      }));
    };

    fetchInfo();
  }, [router.isReady, id]);

  return (
    <div>
      Detail page
      {state.infoStatus ? (
        'Loading ...'
      ) : (
        <p>{JSON.stringify(state.info, null, 2)}</p>
      )}
    </div>
  );
}

export default Detail;
