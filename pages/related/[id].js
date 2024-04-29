import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import _get from 'lodash/get';
import { Layout } from '../../components/layout';
import { fetch } from '../../helpers/request';
import AnimeList from '../../components/animeList';

function Related() {
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState({
    relatedAnimes: [],
    infoStatus: false
  });

  useEffect(() => {
    setState((existingState) => ({
      ...existingState,
      infoStatus: true
    }));

    const fetchRelatedAnimesIds = async () => {
      if (!router.isReady) return;
      const relatedAnimesResponse = await fetch(
        `/categories/${id}/relationships/anime`
      );
      const relatedAnimesIds = _get(
        relatedAnimesResponse,
        'data.data' || []
      ).map((anime) => anime.id);
      const relatedAnimes = await Promise.allSettled(
        relatedAnimesIds.map((animeId) => fetch(`/anime/${animeId}`))
      );

      setState((existingState) => ({
        ...existingState,
        relatedAnimes:
          relatedAnimes
            .filter(({ status }) => status === 'fulfilled')
            .map(({ value }) => value.data.data) || [],
        infoStatus: false
      }));
    };

    fetchRelatedAnimesIds();
  }, [router.isReady, id]);

  return (
    <Layout>
      {state.infoStatus && 'Loading ...'}
      <Box>
        {state.relatedAnimes.length ? (
          <AnimeList list={state.relatedAnimes} />
        ) : null}
      </Box>
    </Layout>
  );
}

export default Related;
