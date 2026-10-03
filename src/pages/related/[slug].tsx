import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import _get from 'lodash/get';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { fetch } from '@/helpers/request';
import AnimeList from '@/components/animeList';
import { Anime } from '@/types';

const ANIMES_PER_PAGE: number = 13;

type relatedStateType = {
  animes: Anime[],
  totalAnimes: number
}

function Related() {
  const router = useRouter();
  const { slug } = router.query;
  const [error, setError] = useState<string>('');
  const [isLoadingRelatedAnimes, setIsLoadingRelatedAnimes] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<relatedStateType>({ animes: [], totalAnimes: 0 });
  const sentinelRef = useRef<HTMLDivElement|null>(null);


  const fetchRelatedAnimes = useCallback(async (page = 1) => {
    if (!router.isReady) return { animes: [], totalAnimes: 0 };
    const animesResponse = await fetch(
      `/anime?filter[categories]=${slug}&page[limit]=${ANIMES_PER_PAGE}&page[offset]=${(page - 1) * ANIMES_PER_PAGE}`
    );

    return {
      animes: _get(animesResponse, 'data.data', []),
      totalAnimes: _get(animesResponse, 'data.meta.count', 0)
    };
  }, [router.isReady, slug]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        !isLoadingRelatedAnimes &&
        data.animes.length < data.totalAnimes
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoadingRelatedAnimes, data.animes.length, data.totalAnimes]
  );

  useEffect(() => {
    const loadMoreAnimes = async () => {
      try {
        setIsLoadingRelatedAnimes(true);
        const data = await fetchRelatedAnimes(page);
        setData((prev) => ({
          animes: [...prev.animes, ...data.animes],
          totalAnimes: data.totalAnimes
        }));
        setError('');
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
        console.error(err);
      } finally {
        setIsLoadingRelatedAnimes(false);
      }
    };

    loadMoreAnimes();
  }, [router.isReady, page, fetchRelatedAnimes]);

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

  const title: string = slug ? String(slug).replace(/-/g, ' ') : '';

  return (
    <Layout>
      <Box>
        <h1>Related Animes: {title}</h1>
        <Box role="region" aria-live="polite" aria-label="Related animes">
          <h2>Results: {data.totalAnimes}</h2>
          {error ? <Typography>{error}</Typography> : null}
          {data.animes?.length ? <AnimeList list={data.animes} /> : null}
        </Box>
        <div ref={sentinelRef} style={{ height: '20px' }} />
        {isLoadingRelatedAnimes && <Typography aria-live="polite">Loading related animes...</Typography>}
        {data.animes.length === 0 && !isLoadingRelatedAnimes && (
          <Typography>No related animes found</Typography>
        )}
      </Box>
    </Layout>
  );
}

// Remount on slug change so pagination state doesn't leak between categories
function RelatedPage() {
  const { query } = useRouter();
  return <Related key={String(query.slug)} />;
}

export default RelatedPage;
