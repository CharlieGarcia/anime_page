import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import _get from 'lodash/get';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { fetch } from '@/helpers/request';
import AnimeList from '@/components/animeList';

function Related() {
  const router = useRouter();
  const { slug } = router.query;
  const [relatedAnimes, setRelatedAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.isReady) {
      // Had to do it this way because of the response size when calling from the getServerSideProps
      const fetchRelatedAnimes = async () => {
        const id = _get((await fetch(`/categories?filter[slug]=${slug}`)), 'data.data[0].id', '');
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

        return relatedAnimes
          .filter(({ status }) => status === 'fulfilled')
          .map(({ value }) => _get(value, 'data.data', {}));
      };

      fetchRelatedAnimes()
        .then((result) => {
          setIsLoading(false);
          setRelatedAnimes(result);
        })
        .catch((err) => {
          setError(err.message);
          setRelatedAnimes([]);
          setIsLoading(false);
        });
    }
  }, [router.isReady, slug]);

  return (
    <Layout>
      <Box>
        {isLoading ? <Typography>Loading...</Typography> : null}
        {error ? <Typography>{error}</Typography> : null}
        {relatedAnimes?.length ? <AnimeList list={relatedAnimes} /> : null}
      </Box>
    </Layout>
  );
}

export default Related;
