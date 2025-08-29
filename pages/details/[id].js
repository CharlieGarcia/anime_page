import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import _get from 'lodash/get';
import _kebabCase from 'lodash/kebabCase';
import Image from '@/components/image';
import Accordion from '@/components/accordion';
import { Layout } from '@/components/layout';
import { fetch } from '@/helpers/request';

const EPISODES_PER_PAGE = 13;

const styles = {
  tags: {
    marginRight: 15,
    marginTop: 15,
    textTransform: 'capitalize'
  }
};

async function fetchAnimeInfo(id) {
  const response = await fetch(`/anime/${id}`);
  return _get(response, 'data.data', {});
}

async function fetchCategories(id) {
  const categoriesResponse = await fetch(`/anime/${id}/categories`);

  return _get(categoriesResponse, 'data.data', []).map((category) => ({
    slug: `/related/${_kebabCase(category.attributes.title)}`,
    id: category.id,
    title: category.attributes.title
  }));
}

function Detail({ info, categories, error }) {
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState({ episodes: [], totalEpisodes: 0 });
  const sentinelRef = useRef(null);

  const fetchEpisodes = useCallback(async (id, offset = 0) => {
    const episodesResponse = await fetch(
      `/anime/${id}/episodes?page[limit]=${EPISODES_PER_PAGE}&page[offset]=${offset}`
    );

    return {
      episodes: _get(episodesResponse, 'data.data', []).map((episode) => ({
        id: episode.id,
        title: episode.attributes.canonicalTitle || 'Not Aired Yet',
        number: episode.attributes.number || '',
        thumbnailUrl: episode.attributes.thumbnail?.original || '',
        synopsis: episode.attributes.synopsis || ''
      })),
      totalEpisodes: _get(episodesResponse, 'data.meta.count', 0)
    };
  }, []);

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        !isLoadingEpisodes &&
        data.episodes.length < data.totalEpisodes
      ) {
        setOffset((prev) => prev + EPISODES_PER_PAGE);
        console.log('loading more episodes');
      }
    },
    [isLoadingEpisodes, data.episodes.length, data.totalEpisodes]
  );

  useEffect(() => {
    const loadMoreEpisodes = async () => {
      try {
        setIsLoadingEpisodes(true);
        const data = await fetchEpisodes(info.id, offset);
        setData((prev) => ({
          episodes: [...prev.episodes, ...data.episodes],
          totalEpisodes: data.totalEpisodes
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingEpisodes(false);
      }
    };

    loadMoreEpisodes();
  }, [offset, info.id, fetchEpisodes]);

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

  if (error) {
    return <Layout>{error}</Layout>;
  }

  return (
    <Layout>
      <Typography variant="h5" color="text.secondary">
        {info.attributes?.titles?.en_jp}
        {` (${data.totalEpisodes} episodes)`}
      </Typography>
      <Box>
        {info?.attributes?.coverImage?.large && (
          <Image
            style={{ width: '100%', height: 'auto' }}
            src={info.attributes.coverImage.large}
            alt="some_alt_text"
          />
        )}
      </Box>
      <Box>
        <Typography variant="h6" color="text.secondary">
          Synopsis:
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {info.attributes?.synopsis}
        </Typography>
        {categories.map((category) => (
          <Button
            variant="outlined"
            style={styles.tags}
            key={category.id}
            href={category.slug}>
            {category.title}
          </Button>
        ))}
      </Box>
      <Box style={{ marginTop: '15px' }}>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ marginBottom: '15px' }}>
          Episodes:
        </Typography>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {data.episodes?.map((episode) => (
            <Accordion
              key={episode.id}
              title={`${episode.number} - ${episode.title}`}
              synopsis={episode.synopsis}
              thumbnailUrl={episode.thumbnailUrl}
            />
          ))}
          <div ref={sentinelRef} style={{ height: '20px' }} />
          {isLoadingEpisodes && <Typography>Loading episodes...</Typography>}
          {data.episodes.length === 0 && !isLoadingEpisodes && (
            <Typography>No episodes found</Typography>
          )}
        </Box>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  let categories = [];
  let info = {};

  try {
    info = await fetchAnimeInfo(id);
    categories = await fetchCategories(id);

    return {
      props: {
        info,
        categories,
        error: null
      }
    };
  } catch (err) {
    return {
      props: {
        error: err
      }
    };
  }
}

export default Detail;
