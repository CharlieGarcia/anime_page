import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import _get from 'lodash/get';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { fetch } from '@/helpers/request';
import AnimeList from '@/components/animeList';

const ANIMES_PER_PAGE = 13;

function Related() {
  const router = useRouter();
  const { slug } = router.query;
  const [error, setError] = useState('');
  const [isLoadingRelatedAnimes, setIsLoadingRelatedAnimes] = useState(false);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState({ animes: [], totalAnimes: 0 });
  const sentinelRef = useRef(null);


  const fetchRelatedAnimes = useCallback(async (offset = 0) => {
    if (!router.isReady) return { animes: [], totalAnimes: 0 };
    const animesResponse = await fetch(
      `/anime?filter[categories]=${slug}&page[limit]=${ANIMES_PER_PAGE}&page[offset]=${offset}`
    );

    return {
      animes: _get(animesResponse, 'data.data', []),
      totalAnimes: _get(animesResponse, 'data.meta.count', 0)
    };
  }, [router.isReady, slug]);

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        !isLoadingRelatedAnimes &&
        data.animes.length < data.totalAnimes
      ) {
        setOffset((prev) => prev + ANIMES_PER_PAGE);
        console.log('loading more animes');
      }
    },
    [isLoadingRelatedAnimes, data.animes.length, data.totalAnimes]
  );

  useEffect(() => {
    const loadMoreAnimes = async () => {
      try {
        setIsLoadingRelatedAnimes(true);
        const data = await fetchRelatedAnimes(offset);
        setData((prev) => ({
          animes: [...prev.animes, ...data.animes],
          totalAnimes: data.totalAnimes
        }));
        setError('');
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoadingRelatedAnimes(false);
      }
    };

    loadMoreAnimes();
  }, [router.isReady, offset, fetchRelatedAnimes]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      threshold: 0.1
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [handleIntersection]);

  return (
    <Layout>
      <Box>
        Results: {data.totalAnimes}
        {error ? <Typography>{error}</Typography> : null}
        {data.animes?.length ? <AnimeList list={data.animes} /> : null}
        <div ref={sentinelRef} style={{ height: '20px' }} />
        {isLoadingRelatedAnimes && <Typography>Loading related animes...</Typography>}
        {data.animes.length === 0 && !isLoadingRelatedAnimes && (
          <Typography>No related animes found</Typography>
        )}
      </Box>
    </Layout>
  );
}

export default Related;
