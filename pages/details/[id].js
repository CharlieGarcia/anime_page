import React, { useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import _get from 'lodash/get';
import Image from '@/components/image';
import Accordion from '@/components/accordion';
import { Layout } from '@/components/layout';
import { fetch } from '@/helpers/request';
import useFetch from '@/hooks/useFetch';

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
  let categories = [];
  const categoriesResponse = await fetch(
    `/anime/${id}/relationships/categories`
  );
  const unHydratedCategories = _get(categoriesResponse, 'data.data', []);

  for (let category of unHydratedCategories) {
    const categoryData = await fetch(`/categories/${category.id}`);

    if (!categoryData.errors) {
      const { attributes, relationships, id } = categoryData.data.data;

      categories.push({
        id,
        title: attributes.title,
        relatedAnimesLink: relationships?.anime?.links?.related
      });
    }
  }

  return categories;
}

function Detail({ info, categories, error }) {
  const hydrateEpisodes = useCallback(async (unHydratedEpisodes) => {
    let episodes = [];
    for (let episode of unHydratedEpisodes) {
      const episodeData = await fetch(`/episodes/${episode.id}`);

      if (!episodeData.errors) {
        const { attributes, id } = episodeData.data.data;
        const title = attributes.canonicalTitle || 'Not Aired Yet';
        const number = attributes.number || '';
        const thumbnailUrl = attributes.thumbnail?.original || '';
        const synopsis = attributes.synopsis || '';

        if (!number && !thumbnailUrl && !synopsis) {
          continue;
        }

        episodes.push({
          id,
          title,
          number,
          thumbnailUrl,
          synopsis
        });
      }
    }

    return episodes;
  }, []);

  const {
    data: episodes,
    isLoading: loadingEpisodes,
    error: episodesError
  } = useFetch(`/anime/${info.id}/relationships/episodes`, {
    onSuccess: hydrateEpisodes
  });

  if (error) {
    return <Layout>{error}</Layout>;
  }

  return (
    <Layout>
      <Typography variant="h5" color="text.secondary">
        {info.attributes?.titles?.en_jp}
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
            href={`/related/${category.id}`}>
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
          {loadingEpisodes && <Typography>Loading episodes...</Typography>}
          {episodesError && <Typography>{episodesError}</Typography>}
          {episodes?.map((episode) => (
            <Accordion
              key={episode.id}
              title={`${episode.number} - ${episode.title}`}
              synopsis={episode.synopsis}
              thumbnailUrl={episode.thumbnailUrl}
            />
          ))}
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
